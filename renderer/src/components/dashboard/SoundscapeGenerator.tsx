import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/useToast";
import {
  Download,
  Edit,
  Heart,
  Loader2,
  Music,
  Palette,
  Play,
  Shuffle,
  Speaker,
  Square,
  Trash2,
} from "lucide-react";

const SAMPLE_RATE = 44_100;
const DEFAULT_DOWNLOAD_SEC = 120;
const FADE_SEC = 0.75;
const ABRUPT_FADE_SEC = 0.01;
const START_GAIN = 0;
const LOCAL_STORAGE_KEY = "adhd_random_favorites_v2";

const initialSoundParams = {
  masterGain: 0.25,
  color: "pink",
  amEnabled: true,
  amWave: "sine",
  amFreq: 16,
  amDepth: 0.5,
  filterType: "lp",
  filterCenter: 800,
  filterQ: 1.0,
  filterLfoOn: true,
  filterLfoFreq: 0.2,
  filterLfoDepth: 400,
};

const presets: { name: string; spec: SoundSpec }[] = [
  {
    name: "Gentle Rain",
    spec: {
      type: "noise",
      params: {
        color: "pink",
        amEnabled: false,
        filterType: "lp",
        filterCenter: 1200,
        filterQ: 0.8,
        filterLfoOn: true,
        filterLfoFreq: 0.1,
        filterLfoDepth: 400,
      },
      masterGain: 0.3,
      abruptStart: false,
    },
  },
  {
    name: "Howling Wind",
    spec: {
      type: "noise",
      params: {
        color: "white",
        amEnabled: false,
        filterType: "bp",
        filterCenter: 800,
        filterQ: 2.5,
        filterLfoOn: true,
        filterLfoFreq: 0.15,
        filterLfoDepth: 600,
      },
      masterGain: 0.2,
      abruptStart: false,
    },
  },
  {
    name: "Thunderstorm Rumble",
    spec: {
      type: "noise",
      params: {
        color: "brown",
        amEnabled: true,
        amWave: "square",
        amFreq: 1.5,
        amDepth: 0.8,
        filterType: "lp",
        filterCenter: 400,
        filterQ: 1.2,
        filterLfoOn: false,
      },
      masterGain: 0.4,
      abruptStart: true,
    },
  },
  {
    name: "Deep Meditation",
    spec: {
      type: "binaural",
      params: {
        carrier: 136.1,
        beat: 8,
        toneWave: "sine",
        noiseBedGain: 0.2,
      },
      masterGain: 0.25,
      abruptStart: false,
    },
  },
  {
    name: "Eerie Drone",
    spec: {
      type: "binaural",
      params: {
        carrier: 110,
        beat: 2,
        toneWave: "sine",
        vibOn: true,
        vibRate: 3,
        vibDepth: 4,
        noiseBedGain: 0.05,
      },
      masterGain: 0.3,
      abruptStart: false,
    },
  },
];

export type SoundSpec = {
  type: string;
  params: Record<string, unknown>;
  masterGain: number;
  abruptStart: boolean;
  duration?: number;
};

export type Favorite = {
  id: string;
  name: string;
  label: string;
  spec: SoundSpec;
  createdAt: number;
};

type Recipe = {
  start: (when: number) => void;
  stop: () => void;
  nodes: AudioNode[];
  label: string;
  spec: SoundSpec;
};

type SoundscapeGeneratorProps = {
  name?: string;
};

type LfoOptions = {
  type?: OscillatorType;
  freq?: number;
  depth?: number;
  targetParam: AudioParam;
  offset?: number;
};

export default function SoundscapeGenerator({ name = "Soundscape Generator" }: SoundscapeGeneratorProps) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const currentNodesRef = useRef<AudioNode[]>([]);
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [status, setStatus] = useState("idle");
  const [lastLabel, setLastLabel] = useState<string | null>(null);
  const [lastSpec, setLastSpec] = useState<SoundSpec | null>(null);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isRendering, setIsRendering] = useState(false);
  const [abruptStart, setAbruptStart] = useState(false);
  const [tactileMode, setTactileMode] = useState(false);
  const [soundParams, setSoundParams] = useState(initialSoundParams);
  const [activeTab, setActiveTab] = useState("player");

  const { toast } = useToast();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        setFavorites(JSON.parse(raw));
      }
    } catch {
      // ignore
    }
  }, []);

  const persistFavorites = useCallback((next: Favorite[]) => {
    setFavorites(next);
    if (typeof window === "undefined") {
      return;
    }
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore persistence errors
    }
  }, []);

  const ensureContext = useCallback(() => {
    if (typeof window === "undefined") {
      return null;
    }
    if (!audioCtxRef.current) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) {
        toast({ variant: "destructive", title: "Audio unavailable" });
        return null;
      }
      const ctx = new Ctor();
      audioCtxRef.current = ctx;
      const masterGain = ctx.createGain();
      masterGain.gain.value = START_GAIN;
      masterGain.connect(ctx.destination);
      masterGainRef.current = masterGain;
    }
    return audioCtxRef.current;
  }, [toast]);

  const rand = useCallback((min: number, max: number) => Math.random() * (max - min) + min, []);
  const choice = useCallback(<T,>(items: T[]) => items[Math.floor(Math.random() * items.length)], []);

  const connectLFO = useCallback(
    (
      ctx: BaseAudioContext,
      { type = "sine", freq = 0.2, depth = 1, targetParam, offset = 0 }: LfoOptions,
    ) => {
      const isOffline = ctx.constructor.name === "OfflineAudioContext";
      const lfo = ctx.createOscillator();
      lfo.type = type;
      lfo.frequency.value = freq;

      const lfoGain = ctx.createGain();
      lfoGain.gain.value = depth;

      if (offset !== 0) {
        const dc = ctx.createConstantSource();
        dc.offset.value = offset;
        dc.connect(targetParam);
        dc.start();
        if (!isOffline) {
          currentNodesRef.current.push(dc);
        }
      }

      lfo.connect(lfoGain);
      lfoGain.connect(targetParam);
      lfo.start();
      if (!isOffline) {
        currentNodesRef.current.push(lfo, lfoGain);
      }

      return { lfo, lfoGain };
    },
    [],
  );

  const makeNoiseBuffer = useCallback((ctx: BaseAudioContext, seconds = 2) => {
    const length = Math.max(1, Math.floor(seconds * ctx.sampleRate));
    const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
      const chData = buffer.getChannelData(channel);
      for (let i = 0; i < length; i += 1) {
        chData[i] = Math.random() * 2 - 1;
      }
    }
    return buffer;
  }, []);

  const colorize = useCallback((node: AudioNode, ctx: BaseAudioContext, color: string) => {
    if (color === "pink") {
      const shelf = ctx.createBiquadFilter();
      shelf.type = "lowshelf";
      shelf.frequency.value = 1_000;
      shelf.gain.value = 6;
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 8_000;
      lp.Q.value = 0.3;
      node.connect(shelf);
      shelf.connect(lp);
      return lp;
    }
    if (color === "brown") {
      const lp1 = ctx.createBiquadFilter();
      lp1.type = "lowpass";
      lp1.frequency.value = 1_200;
      lp1.Q.value = 0.5;
      const lp2 = ctx.createBiquadFilter();
      lp2.type = "lowpass";
      lp2.frequency.value = 600;
      lp2.Q.value = 0.7;
      node.connect(lp1);
      lp1.connect(lp2);
      return lp2;
    }
    if (color === "blue") {
      const hs = ctx.createBiquadFilter();
      hs.type = "highshelf";
      hs.frequency.value = 3_000;
      hs.gain.value = 6;
      node.connect(hs);
      return hs;
    }
    return node;
  }, []);

  const stereoPanner = useCallback((ctx: BaseAudioContext, panValue: number) => {
    if ("createStereoPanner" in ctx) {
      const panner = (ctx as AudioContext).createStereoPanner();
      panner.pan.value = panValue;
      return panner;
    }
    return ctx.createGain();
  }, []);

  const hardStopAll = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx || !masterGainRef.current) {
      return;
    }
    if (stopTimerRef.current) {
      clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }
    try {
      masterGainRef.current.gain.cancelScheduledValues(ctx.currentTime);
      masterGainRef.current.gain.setValueAtTime(0.0001, ctx.currentTime);
    } catch {
      // ignore scheduling errors
    }
    currentNodesRef.current.forEach((node) => {
      try {
        if ("stop" in node) {
          (node as AudioScheduledSourceNode).stop();
        }
        node.disconnect?.();
      } catch {
        // ignore node errors
      }
    });
    currentNodesRef.current = [];
    setStatus("idle");
  }, []);

  const buildFromSpec = useCallback(
    (ctx: BaseAudioContext, spec: SoundSpec, destGainOverride: GainNode | null = null): Recipe => {
      const dest = destGainOverride ?? masterGainRef.current;
      if (!dest) {
        return { start: () => {}, stop: () => {}, nodes: [], label: "Unavailable", spec };
      }

      const params = spec.params ?? {};
      const type = spec.type ?? "noise";

      if (type === "noise") {
        const source = ctx.createBufferSource();
        source.buffer = makeNoiseBuffer(ctx, 2);
        source.loop = true;
        const colored = colorize(source, ctx, String(params.color ?? "white"));
        const amp = ctx.createGain();
        amp.gain.value = 1;
        if (params.amEnabled) {
          connectLFO(ctx, {
            type: (params.amWave as OscillatorType) ?? "sine",
            freq: Number(params.amFreq ?? 16),
            depth: Number(params.amDepth ?? 0.5) * 0.5,
            targetParam: amp.gain,
            offset: 1 - Number(params.amDepth ?? 0.5) * 0.25,
          });
        }
        colored.connect(amp);
        let lastNode: AudioNode = amp;
        const filterType = String(params.filterType ?? "none");
        if (filterType !== "none") {
          const filter = ctx.createBiquadFilter();
          filter.type = filterType === "bp" ? "bandpass" : filterType === "lp" ? "lowpass" : "highpass";
          filter.frequency.value = Number(params.filterCenter ?? 800);
          filter.Q.value = Number(params.filterQ ?? 1.0);
          lastNode.connect(filter);
          lastNode = filter;
          if (params.filterLfoOn) {
            connectLFO(ctx, {
              type: "sine",
              freq: Number(params.filterLfoFreq ?? 0.2),
              depth: Number(params.filterLfoDepth ?? 400),
              targetParam: filter.frequency,
              offset: Number(params.filterCenter ?? 800),
            });
          }
        }
        const panner = stereoPanner(ctx, 0);
        lastNode.connect(panner);
        panner.connect(dest);

        const labelParts = [String(params.color ?? "white").toUpperCase(), "noise"];
        if (params.amEnabled) {
          labelParts.push(
            `+ ${(params.amWave ?? "sine")} AM @ ${Number(params.amFreq ?? 16).toFixed(1)} Hz`,
          );
        }
        if (filterType !== "none") {
          labelParts.push(`+ ${filterType.toUpperCase()} sweep`);
        }

        return {
          start: (when) => source.start(when),
          stop: () => source.stop(),
          nodes: [source, colored, amp, lastNode, panner],
          label: labelParts.join(" "),
          spec,
        };
      }

      if (type === "binaural") {
        const carrier = Number((params as Record<string, number>).carrier ?? 400);
        const beat = Number((params as Record<string, number>).beat ?? 18);
        const toneWave = String((params as Record<string, string>).toneWave ?? "sine");
        const noiseBedGain = Number((params as Record<string, number>).noiseBedGain ?? 0.2);
        const leftOsc = ctx.createOscillator();
        leftOsc.type = toneWave as OscillatorType;
        leftOsc.frequency.value = carrier;
        const rightOsc = ctx.createOscillator();
        rightOsc.type = toneWave as OscillatorType;
        rightOsc.frequency.value = carrier + beat;
        const leftPan = stereoPanner(ctx, -0.6);
        const rightPan = stereoPanner(ctx, 0.6);
        const toneGain = ctx.createGain();
        toneGain.gain.value = 0.45;
        leftOsc.connect(leftPan).connect(toneGain);
        rightOsc.connect(rightPan).connect(toneGain);
        toneGain.connect(dest);
        const noise = ctx.createBufferSource();
        noise.buffer = makeNoiseBuffer(ctx, 2);
        noise.loop = true;
        const noiseColored = colorize(noise, ctx, "pink");
        const noiseGain = ctx.createGain();
        noiseGain.gain.value = noiseBedGain;
        noiseColored.connect(noiseGain).connect(dest);

        return {
          start: (when) => {
            leftOsc.start(when);
            rightOsc.start(when);
            noise.start(when);
          },
          stop: () => {
            leftOsc.stop();
            rightOsc.stop();
            noise.stop();
          },
          nodes: [leftOsc, rightOsc, leftPan, rightPan, toneGain, noise, noiseColored, noiseGain],
          label: `Binaural ~${beat.toFixed(1)} Hz + pink bed`,
          spec,
        };
      }

      return { start: () => {}, stop: () => {}, nodes: [], label: "Unknown", spec };
    },
    [colorize, connectLFO, makeNoiseBuffer, stereoPanner],
  );

  const playWithSpec = useCallback(
    async (spec: SoundSpec) => {
      const ctx = ensureContext();
      if (!ctx || !masterGainRef.current) {
        return;
      }
      await ctx.resume();
      hardStopAll();
      const recipe = buildFromSpec(ctx, spec);
      currentNodesRef.current.push(...recipe.nodes);
      const now = ctx.currentTime;
      let targetGain = spec.masterGain ?? 0.25;
      const abrupt = spec.abruptStart ?? abruptStart;
      if (tactileMode) {
        targetGain = Math.min(targetGain, 0.25);
      }
      masterGainRef.current.gain.cancelScheduledValues(now);
      masterGainRef.current.gain.setValueAtTime(masterGainRef.current.gain.value ?? START_GAIN, now);
      masterGainRef.current.gain.linearRampToValueAtTime(
        targetGain,
        now + (abrupt ? ABRUPT_FADE_SEC : FADE_SEC),
      );
      recipe.start(now + 0.01);
      setLastLabel(recipe.label);
      setLastSpec({ ...spec, masterGain: targetGain, abruptStart: abrupt });
      setStatus("playing");
    },
    [abruptStart, buildFromSpec, ensureContext, hardStopAll, tactileMode],
  );

  const buildRandomSpec = useCallback((): SoundSpec => {
    if (tactileMode) {
      const pattern = choice(["steady", "pulse", "sweep", "beat"]);
      return {
        type: "noise",
        params: {
          color: "pink",
          pattern,
        },
        masterGain: 0.25,
        abruptStart,
      };
    }
    const spec: SoundSpec = {
      type: "noise",
      params: {
        color: choice(["white", "pink", "brown", "blue"]),
        amEnabled: Math.random() < 0.75,
        amWave: choice(["sine", "triangle", "square"]),
        amFreq: rand(6, 40),
        amDepth: rand(0.2, 0.9),
        filterType: choice(["none", "bp", "lp", "hp"]),
        filterCenter: rand(200, 4_000),
        filterQ: rand(0.3, 2),
        filterLfoOn: Math.random() < 0.6,
        filterLfoFreq: rand(0.05, 0.35),
        filterLfoDepth: rand(200, 1_200),
      },
      masterGain: rand(0.18, 0.34),
      abruptStart,
    };
    return spec;
  }, [abruptStart, choice, rand, tactileMode]);

  const playRandom = useCallback(async () => {
    const ctx = ensureContext();
    if (!ctx) {
      return;
    }
    await ctx.resume();
    hardStopAll();
    const spec = buildRandomSpec();
    playWithSpec(spec);
  }, [buildRandomSpec, ensureContext, hardStopAll, playWithSpec]);

  const playFromControls = useCallback(() => {
    playWithSpec({
      type: "noise",
      params: soundParams,
      masterGain: soundParams.masterGain,
      abruptStart,
    });
  }, [abruptStart, playWithSpec, soundParams]);

  const stopAll = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx || !masterGainRef.current) {
      return;
    }
    const now = ctx.currentTime;
    masterGainRef.current.gain.cancelScheduledValues(now);
    masterGainRef.current.gain.setValueAtTime(masterGainRef.current.gain.value ?? 0, now);
    masterGainRef.current.gain.linearRampToValueAtTime(0.0001, now + FADE_SEC);
    stopTimerRef.current = setTimeout(() => {
      hardStopAll();
    }, (FADE_SEC + 0.05) * 1_000);
  }, [hardStopAll]);

  useEffect(() => {
    if (status === "playing" && activeTab === "studio") {
      playFromControls();
    }
  }, [activeTab, playFromControls, status, soundParams]);

  const saveFavorite = useCallback(() => {
    if (!lastSpec || !lastLabel) {
      return;
    }
    const defaultName = lastLabel;
    const manualName = typeof window !== "undefined" ? window.prompt("Name this favorite:", defaultName) : null;
    if (manualName === null) {
      return;
    }
    const item: Favorite = {
      id: crypto.randomUUID?.() ?? String(Date.now()),
      name: manualName || defaultName,
      label: lastLabel,
      spec: lastSpec,
      createdAt: Date.now(),
    };
    persistFavorites([item, ...favorites].slice(0, 50));
    toast({ title: "Favorite saved!", description: item.name });
  }, [favorites, lastLabel, lastSpec, persistFavorites, toast]);

  const renameFavorite = useCallback(
    (id: string) => {
      const fav = favorites.find((item) => item.id === id);
      if (!fav || typeof window === "undefined") {
        return;
      }
      const nextName = window.prompt("Rename favorite:", fav.name || fav.label);
      if (!nextName) {
        return;
      }
      persistFavorites(favorites.map((item) => (item.id === id ? { ...item, name: nextName } : item)));
    },
    [favorites, persistFavorites],
  );

  const deleteFavorite = useCallback(
    (id: string) => {
      persistFavorites(favorites.filter((item) => item.id !== id));
    },
    [favorites, persistFavorites],
  );

  const downloadSpecAsWav = useCallback(
    async (spec: SoundSpec, filenameBase = "ADHD_Sound") => {
      try {
        setIsRendering(true);
        const duration = Math.max(2, Math.min(600, Math.round(spec.duration ?? DEFAULT_DOWNLOAD_SEC)));
        const frames = duration * SAMPLE_RATE;
        const ctx = new OfflineAudioContext(2, frames, SAMPLE_RATE);
        const master = ctx.createGain();
        master.gain.setValueAtTime(0.0001, 0);
        master.connect(ctx.destination);
        const recipe = buildFromSpec(ctx, spec, master);
        const target = spec.masterGain ?? 0.25;
        const fadeIn = spec.abruptStart ? ABRUPT_FADE_SEC : 0.05;
        master.gain.linearRampToValueAtTime(target, fadeIn);
        master.gain.setValueAtTime(target, Math.max(fadeIn, duration - 0.1));
        master.gain.linearRampToValueAtTime(0.0001, duration);
        recipe.start(0);
        const buffer = await ctx.startRendering();

        const numChannels = buffer.numberOfChannels;
        const sampleRate = buffer.sampleRate;
        const numFrames = buffer.length;
        const bytesPerSample = 2;
        const blockAlign = numChannels * bytesPerSample;
        const byteRate = sampleRate * blockAlign;
        const dataSize = numFrames * blockAlign;
        const headerSize = 44;
        const totalSize = headerSize + dataSize;
        const arrayBuffer = new ArrayBuffer(totalSize);
        const view = new DataView(arrayBuffer);

        const writeString = (offset: number, str: string) => {
          for (let i = 0; i < str.length; i += 1) {
            view.setUint8(offset + i, str.charCodeAt(i));
          }
        };

        writeString(0, "RIFF");
        view.setUint32(4, totalSize - 8, true);
        writeString(8, "WAVE");
        writeString(12, "fmt ");
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, byteRate, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, 16, true);
        writeString(36, "data");
        view.setUint32(40, dataSize, true);

        const channelData: Float32Array[] = [];
        for (let channel = 0; channel < numChannels; channel += 1) {
          channelData[channel] = buffer.getChannelData(channel);
        }
        let offset = headerSize;
        for (let i = 0; i < numFrames; i += 1) {
          for (let channel = 0; channel < numChannels; channel += 1) {
            let sample = channelData[channel][i];
            sample = Math.max(-1, Math.min(1, sample));
            view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
            offset += 2;
          }
        }

        const blob = new Blob([arrayBuffer], { type: "audio/wav" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `${filenameBase.replace(/[^a-z0-9\-_]+/gi, "_")}.wav`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        setTimeout(() => URL.revokeObjectURL(url), 5_000);
        toast({ title: "Download complete!", description: `${filenameBase}.wav` });
      } catch (error) {
        console.error(error);
        toast({ variant: "destructive", title: "Download failed", description: "Could not render audio." });
      } finally {
        setIsRendering(false);
      }
    },
    [buildFromSpec, toast],
  );

  const handlePresetSelect = useCallback(
    (presetSpec: SoundSpec) => {
      playWithSpec(presetSpec);
      setSoundParams({ ...initialSoundParams, ...presetSpec.params, masterGain: presetSpec.masterGain });
      setActiveTab("studio");
    },
    [playWithSpec],
  );

  return (
    <Card className="flex h-full flex-col border-0 bg-transparent shadow-none">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Music className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>Generative audio for focus and stimulation.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex min-h-0 flex-1 flex-col">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="player">Player</TabsTrigger>
            <TabsTrigger value="presets">Presets</TabsTrigger>
            <TabsTrigger value="studio">Studio</TabsTrigger>
            <TabsTrigger value="favorites">Favorites ({favorites.length})</TabsTrigger>
          </TabsList>

          <TabsContent
            value="player"
            className="flex flex-1 flex-col items-center justify-center gap-4 pt-4"
          >
            <div className="flex items-center justify-center gap-4">
              <Button onClick={playRandom} size="lg" className="h-16 w-24">
                <Shuffle className="h-8 w-8" />
              </Button>
              <Button
                onClick={() => stopAll()}
                size="lg"
                variant="destructive"
                className="h-16 w-24"
                disabled={status !== "playing"}
              >
                <Square className="h-8 w-8" />
              </Button>
            </div>
            <div className="w-full max-w-sm space-y-3 pt-4">
              <div className="flex items-center justify-between rounded-lg bg-secondary p-2">
                <Label htmlFor="abrupt-start" className="flex items-center gap-2 text-sm font-normal">
                  Abrupt Start
                </Label>
                <Switch id="abrupt-start" checked={abruptStart} onCheckedChange={setAbruptStart} />
              </div>
              <div className="flex items-center justify-between rounded-lg bg-secondary p-2">
                <Label htmlFor="tactile-mode" className="flex items-center gap-2 text-sm font-normal">
                  <Speaker className="h-4 w-4" /> Tactile Resonance
                </Label>
                <Switch id="tactile-mode" checked={tactileMode} onCheckedChange={setTactileMode} />
              </div>
            </div>
            <div className="mt-4 w-full min-h-[60px] rounded-lg bg-secondary p-2 text-center">
              <p className="text-xs text-muted-foreground">Now Playing</p>
              <p className="truncate text-sm font-semibold">{lastLabel ?? "—"}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={saveFavorite} disabled={!lastSpec || status !== "playing"}>
                <Heart className="mr-2 h-4 w-4" /> Save
              </Button>
              <Button
                variant="outline"
                onClick={() => lastSpec && downloadSpecAsWav(lastSpec, lastLabel ?? "sound")}
                disabled={!lastSpec || isRendering}
              >
                {isRendering ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Download
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="presets" className="min-h-0 flex-1 pt-2">
            <ScrollArea className="-mr-4 h-full pr-4">
              <div className="grid grid-cols-2 gap-4">
                {presets.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    className="h-16 text-base"
                    onClick={() => handlePresetSelect(preset.spec)}
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="studio" className="min-h-0 flex-1 pt-2">
            <div className="mb-2 flex justify-center gap-2">
              <Button onClick={playFromControls} disabled={status === "playing"}>
                <Play className="mr-2 h-4 w-4" /> Play
              </Button>
              <Button onClick={() => stopAll()} variant="destructive" disabled={status !== "playing"}>
                <Square className="mr-2 h-4 w-4" /> Stop
              </Button>
            </div>
            <ScrollArea className="-mr-4 h-[calc(100%-40px)] pr-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Master Gain: {soundParams.masterGain.toFixed(2)}</Label>
                  <Slider
                    value={[soundParams.masterGain]}
                    onValueChange={([value]) => setSoundParams((prev) => ({ ...prev, masterGain: value }))}
                    min={0}
                    max={0.5}
                    step={0.01}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Noise Color</Label>
                    <Select
                      value={soundParams.color}
                      onValueChange={(value) => setSoundParams((prev) => ({ ...prev, color: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="white">White</SelectItem>
                        <SelectItem value="pink">Pink</SelectItem>
                        <SelectItem value="brown">Brown</SelectItem>
                        <SelectItem value="blue">Blue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>AM Wave</Label>
                    <Select
                      value={String(soundParams.amWave)}
                      onValueChange={(value) => setSoundParams((prev) => ({ ...prev, amWave: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sine">Sine</SelectItem>
                        <SelectItem value="square">Square</SelectItem>
                        <SelectItem value="triangle">Triangle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>AM Freq: {soundParams.amFreq.toFixed(1)} Hz</Label>
                  <Slider
                    value={[soundParams.amFreq]}
                    onValueChange={([value]) => setSoundParams((prev) => ({ ...prev, amFreq: value }))}
                    min={1}
                    max={50}
                    step={0.5}
                  />
                </div>
                <div className="space-y-2">
                  <Label>AM Depth: {soundParams.amDepth.toFixed(2)}</Label>
                  <Slider
                    value={[soundParams.amDepth]}
                    onValueChange={([value]) => setSoundParams((prev) => ({ ...prev, amDepth: value }))}
                    min={0}
                    max={1}
                    step={0.05}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Filter Type</Label>
                    <Select
                      value={String(soundParams.filterType)}
                      onValueChange={(value) => setSoundParams((prev) => ({ ...prev, filterType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="lp">Lowpass</SelectItem>
                        <SelectItem value="hp">Highpass</SelectItem>
                        <SelectItem value="bp">Bandpass</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Filter Q: {soundParams.filterQ.toFixed(2)}</Label>
                    <Slider
                      value={[soundParams.filterQ]}
                      onValueChange={([value]) => setSoundParams((prev) => ({ ...prev, filterQ: value }))}
                      min={0.1}
                      max={5}
                      step={0.1}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Filter Center: {soundParams.filterCenter.toFixed(0)} Hz</Label>
                  <Slider
                    value={[soundParams.filterCenter]}
                    onValueChange={([value]) => setSoundParams((prev) => ({ ...prev, filterCenter: value }))}
                    min={100}
                    max={8_000}
                    step={10}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Filter LFO Freq: {soundParams.filterLfoFreq.toFixed(2)} Hz</Label>
                  <Slider
                    value={[soundParams.filterLfoFreq]}
                    onValueChange={([value]) => setSoundParams((prev) => ({ ...prev, filterLfoFreq: value }))}
                    min={0.05}
                    max={1}
                    step={0.05}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Filter LFO Depth: {soundParams.filterLfoDepth.toFixed(0)} Hz</Label>
                  <Slider
                    value={[soundParams.filterLfoDepth]}
                    onValueChange={([value]) => setSoundParams((prev) => ({ ...prev, filterLfoDepth: value }))}
                    min={0}
                    max={2_000}
                    step={10}
                  />
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="favorites" className="min-h-0 flex-1">
            <ScrollArea className="-mr-4 h-full pr-4">
              {favorites.length === 0 ? (
                <p className="pt-10 text-center text-muted-foreground">No favorites yet.</p>
              ) : (
                <div className="space-y-2">
                  {favorites.map((favorite) => (
                    <div key={favorite.id} className="rounded-lg bg-secondary p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold">{favorite.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{favorite.label}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => renameFavorite(favorite.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => deleteFavorite(favorite.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => playWithSpec(favorite.spec)}
                        >
                          <Play className="mr-2 h-4 w-4" /> Play
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => downloadSpecAsWav(favorite.spec, favorite.name)}
                          disabled={isRendering}
                        >
                          {isRendering ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="mr-2 h-4 w-4" />
                          )}
                          WAV
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
