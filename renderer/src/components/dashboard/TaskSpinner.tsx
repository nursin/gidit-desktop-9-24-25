import { useCallback, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/useToast";
import { Dices, Target } from "lucide-react";

const DEFAULT_TASKS = [
  "Organize your desktop",
  "Reply to 3 old emails",
  "Stretch for 5 minutes",
  "Plan tomorrow's meals",
  "Tidy up your workspace",
  "Read an article",
  "Do a 10-minute brain dump",
  "Unsubscribe from 5 newsletters",
];

const COLORS = [
  "#F44336",
  "#FF5722",
  "#FF9800",
  "#FFC107",
  "#FFEB3B",
  "#CDDC39",
  "#8BC34A",
  "#4CAF50",
  "#00BCD4",
  "#2196F3",
  "#3F51B5",
  "#673AB7",
];

const MIN_SPINS = 5;
const MAX_SPINS = 9;

const MIN_DURATION_MS = 10_000;
const MAX_DURATION_MS = 15_000;

const START_INTERVAL_MS = 50;
const SLOWDOWN_THRESHOLD_MS = 150;
const INITIAL_SLOWDOWN_RATE = 1.05;
const FINAL_SLOWDOWN_RATE = 1.1;

const NOTE_FREQUENCY = 1_000;
const NOTE_DURATION = 0.05;
const WIN_FREQUENCY = 800;

export type TaskSpinnerProps = {
  name?: string;
  tasks?: string[];
};

export default function TaskSpinner({
  name = "Task Spinner",
  tasks: customTasks,
}: TaskSpinnerProps) {
  const tasks = customTasks?.length ? customTasks : DEFAULT_TASKS;
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { toast } = useToast();

  const sliceAngle = 360 / tasks.length;

  const ensureAudioContext = useCallback(() => {
    if (typeof window === "undefined") {
      return null;
    }
    if (!audioCtxRef.current) {
      try {
        const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Ctor) {
          toast({ variant: "destructive", title: "Audio error", description: "Web Audio API unsupported" });
          return null;
        }
        const ctx = new Ctor();
        audioCtxRef.current = ctx;
      } catch (error) {
        console.error("Unable to create audio context", error);
        toast({ variant: "destructive", title: "Audio error", description: "Cannot use Web Audio API" });
        return null;
      }
    }
    return audioCtxRef.current;
  }, [toast]);

  const playTick = useCallback((frequency: number, duration: number) => {
    const ctx = audioCtxRef.current;
    if (!ctx) {
      return;
    }
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "square";
    oscillator.frequency.value = frequency;
    gain.gain.value = 0.1;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);
  }, []);

  const spinWheel = useCallback(() => {
    if (isSpinning) {
      return;
    }
    const ctx = ensureAudioContext();
    if (!ctx) {
      return;
    }
    void ctx.resume();

    setIsSpinning(true);
    setSelectedTask(null);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const spins = Math.floor(Math.random() * (MAX_SPINS - MIN_SPINS + 1)) + MIN_SPINS;
    const randomIndex = Math.floor(Math.random() * tasks.length);
    const targetRotation = 360 - randomIndex * sliceAngle;
    const totalRotation = 360 * spins + targetRotation;
    const spinDuration = Math.random() * (MAX_DURATION_MS - MIN_DURATION_MS) + MIN_DURATION_MS;

    setRotation((prev) => prev + totalRotation);

    let interval = START_INTERVAL_MS;
    let slowdownRate = INITIAL_SLOWDOWN_RATE;

    const scheduleTick = () => {
      playTick(NOTE_FREQUENCY, NOTE_DURATION);
      interval *= slowdownRate;
      if (interval > SLOWDOWN_THRESHOLD_MS) {
        slowdownRate = FINAL_SLOWDOWN_RATE;
      }
      timerRef.current = setTimeout(scheduleTick, interval);
    };

    timerRef.current = setTimeout(scheduleTick, interval);

    setTimeout(() => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      playTick(WIN_FREQUENCY, 0.1);
      setTimeout(() => playTick(WIN_FREQUENCY, 0.1), 300);
      setTimeout(() => playTick(WIN_FREQUENCY, 0.1), 600);
      setSelectedTask(tasks[randomIndex]);
      setIsSpinning(false);
    }, spinDuration);
  }, [ensureAudioContext, isSpinning, playTick, sliceAngle, tasks]);

  const wheelStyle = useMemo(
    (): React.CSSProperties => ({
      transform: `rotate(${rotation}deg)`,
      transition: `transform ${isSpinning ? 12 : 0}s cubic-bezier(0.25, 0.1, 0.25, 1)`,
    }),
    [isSpinning, rotation],
  );

  const gradient = useMemo(() => {
    return COLORS.slice(0, tasks.length)
      .map((color, index) => `${color} ${index * sliceAngle}deg ${(index + 1) * sliceAngle}deg`)
      .join(", ");
  }, [sliceAngle, tasks.length]);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Target className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>Let fate decide your next task.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col items-center justify-center gap-6">
        <div className="relative h-80 w-80">
          <div className="absolute -top-5 left-1/2 z-20 h-0 w-0 -translate-x-1/2 border-l-8 border-r-8 border-l-transparent border-r-transparent border-t-8 border-t-primary" />
          <div
            className="relative h-full w-full overflow-hidden rounded-full border-4 border-primary/50 shadow-lg"
            style={{
              backgroundImage: `conic-gradient(${gradient})`,
              ...wheelStyle,
            }}
          >
            {tasks.map((task, index) => {
              const rotate = index * sliceAngle + sliceAngle / 2;
              return (
                <div
                  key={task}
                  className="absolute top-0 left-1/2 flex h-1/2 w-1/2 origin-bottom-left items-center justify-center"
                  style={{ transform: `rotate(${rotate}deg)` }}
                >
                  <span
                    className="block max-w-[80px] overflow-hidden text-center text-xs font-semibold text-white"
                    style={{
                      transform: "translateX(-50%) translateY(1.6rem) rotate(-90deg)",
                      textShadow: "1px 1px 1px rgba(0,0,0,0.3)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {task}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="absolute left-1/2 top-1/2 z-10 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary/50 bg-background" />
        </div>
        <div className="min-h-[40px]">
          {selectedTask ? (
            <p className="text-center text-lg font-bold">Your task: {selectedTask}</p>
          ) : (
            <p className="text-center text-muted-foreground">Spin the wheel to choose a task.</p>
          )}
        </div>
        <Button onClick={spinWheel} disabled={isSpinning}>
          <Dices className="mr-2 h-4 w-4" />
          {isSpinning ? "Spinning..." : "Spin the Wheel"}
        </Button>
      </CardContent>
    </Card>
  );
}
