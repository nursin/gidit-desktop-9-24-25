import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { Angry, BrainCircuit, Frown, Laugh, Meh, PenSquare, Smile } from "lucide-react";

type MindfulMomentsProps = {
  name?: string;
};

type MoodOption = {
  level: number;
  label: string;
  icon: LucideIcon;
};

type BreathingState = "idle" | "in" | "hold" | "out";

const moods: MoodOption[] = [
  { level: 1, icon: Angry, label: "Awful" },
  { level: 2, icon: Frown, label: "Bad" },
  { level: 3, icon: Meh, label: "Okay" },
  { level: 4, icon: Smile, label: "Good" },
  { level: 5, icon: Laugh, label: "Great" },
];

const thoughtPrompts = [
  "What's one thing I'm assuming to be true right now?",
  "Is there a more positive or useful way to look at this situation?",
  "What would I tell a friend who was thinking this way?",
  "What is one piece of evidence that contradicts this negative thought?",
  "If this thought weren't true, what would that mean for me?",
];

export default function MindfulMoments({ name = "Mindful Moments" }: MindfulMomentsProps) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [thought, setThought] = useState("");
  const [prompt, setPrompt] = useState(thoughtPrompts[0]);
  const [breathingState, setBreathingState] = useState<BreathingState>("idle");
  const [breathInstruction, setBreathInstruction] = useState("Click Start to Begin");
  const { toast } = useToast();

  useEffect(() => {
    if (breathingState === "idle") {
      return;
    }

    let timeoutId: number | undefined;

    if (breathingState === "in") {
      setBreathInstruction("Breathe in...");
      timeoutId = window.setTimeout(() => setBreathingState("hold"), 4000);
    } else if (breathingState === "hold") {
      setBreathInstruction("Hold");
      timeoutId = window.setTimeout(() => setBreathingState("out"), 7000);
    } else if (breathingState === "out") {
      setBreathInstruction("Breathe out...");
      timeoutId = window.setTimeout(() => setBreathingState("in"), 8000);
    }

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [breathingState]);

  const handleLogMood = () => {
    if (!selectedMood) {
      return;
    }
    toast({ title: "Mood Logged", description: "Your mood has been saved for today." });
  };

  const nextPrompt = useCallback(() => {
    const others = thoughtPrompts.filter((entry) => entry !== prompt);
    const options = others.length > 0 ? others : thoughtPrompts;
    const randomIndex = Math.floor(Math.random() * options.length);
    setPrompt(options[randomIndex]);
  }, [prompt]);

  const handleSaveThought = () => {
    if (!thought.trim()) {
      return;
    }
    toast({ title: "Thought Saved", description: "Your reflection has been recorded." });
    setThought("");
    nextPrompt();
  };

  const toggleBreathing = () => {
    if (breathingState === "idle") {
      setBreathingState("in");
    } else {
      setBreathingState("idle");
      setBreathInstruction("Click Start to Begin");
    }
  };

  return (
    <Card className="flex h-full flex-col border-0 bg-transparent shadow-none">
      <CardHeader>
        <div className="flex items-center gap-3">
          <BrainCircuit className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>Tools for emotional awareness and calm.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col">
        <Tabs defaultValue="check-in" className="flex flex-1 flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="check-in">Check-in</TabsTrigger>
            <TabsTrigger value="reflect">Reflect</TabsTrigger>
            <TabsTrigger value="breathe">Breathe</TabsTrigger>
          </TabsList>

          <TabsContent
            value="check-in"
            className="flex flex-1 flex-col items-center justify-center gap-4"
          >
            <p className="text-lg font-medium">How are you feeling right now?</p>
            <div className="flex w-full max-w-sm items-end justify-around">
              {moods.map((mood) => (
                <button
                  key={mood.level}
                  type="button"
                  onClick={() => setSelectedMood(mood.level)}
                  className="text-muted-foreground transition-colors hover:text-primary focus:outline-none focus-visible:text-primary"
                >
                  <div
                    className={cn(
                      "rounded-full p-2 transition-colors",
                      selectedMood === mood.level ? "bg-primary/10 text-primary" : "",
                    )}
                  >
                    <mood.icon className="h-8 w-8" />
                  </div>
                  <span className="text-xs font-medium">{mood.label}</span>
                </button>
              ))}
            </div>
            <Button onClick={handleLogMood} disabled={!selectedMood}>
              Log Mood
            </Button>
          </TabsContent>

          <TabsContent value="reflect" className="flex flex-1 flex-col gap-4 pt-4">
            <div className="rounded-lg bg-secondary p-3">
              <p className="text-sm font-semibold">Cognitive Reframing Prompt</p>
              <p className="text-xs text-muted-foreground">{prompt}</p>
            </div>
            <Textarea
              placeholder="Write down a thought that's bothering you..."
              className="flex-1 resize-none"
              value={thought}
              onChange={(event) => setThought(event.target.value)}
            />
            <Button onClick={handleSaveThought} disabled={!thought.trim()}>
              <PenSquare className="mr-2 h-4 w-4" />
              Save Thought
            </Button>
          </TabsContent>

          <TabsContent
            value="breathe"
            className="flex flex-1 flex-col items-center justify-center gap-6"
          >
            <div className="relative flex h-40 w-40 items-center justify-center">
              <div
                className={cn(
                  "absolute h-full w-full rounded-full bg-primary/20 transition-all duration-[4000ms] ease-in-out",
                  breathingState === "idle" && "scale-50",
                  breathingState === "in" && "scale-100",
                  breathingState === "hold" && "scale-100",
                  breathingState === "out" && "scale-50",
                )}
              />
              <div className="h-24 w-24 rounded-full bg-primary/30" />
            </div>
            <p className="h-8 text-center text-2xl font-semibold">{breathInstruction}</p>
            <Button onClick={toggleBreathing}>{breathingState === "idle" ? "Start" : "Stop"}</Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
