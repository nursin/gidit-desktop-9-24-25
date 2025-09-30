import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Hourglass, Play } from "lucide-react";

const DURATION_SECONDS = 25 * 60;

type Task = {
  id: number;
  title: string;
};

type NowNextPanelProps = {
  name?: string;
};

export default function NowNextPanel({ name = "Now & Next" }: NowNextPanelProps) {
  const [nowTask, setNowTask] = useState<Task>({ id: 1, title: "Draft proposal email" });
  const [nextTask, setNextTask] = useState<Task>({ id: 2, title: "Review Q3 analytics" });
  const [secondsLeft, setSecondsLeft] = useState(DURATION_SECONDS);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
      return;
    }

    intervalRef.current = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          if (intervalRef.current) {
            window.clearInterval(intervalRef.current);
          }
          setIsActive(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [isActive]);

  const handleStart = () => {
    if (secondsLeft === 0) {
      setSecondsLeft(DURATION_SECONDS);
    }
    setIsActive(true);
  };

  const handleComplete = () => {
    setIsActive(false);
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }
    setNowTask(nextTask);
    setNextTask({ id: nextTask.id + 1, title: "Plan tomorrow's agenda" });
    setSecondsLeft(DURATION_SECONDS);
  };

  const progress = ((DURATION_SECONDS - secondsLeft) / DURATION_SECONDS) * 100;

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Hourglass className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>Focus on one task at a time.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-grow flex-col justify-around">
        <div className="rounded-lg border border-primary/20 bg-primary/10 p-4">
          <h3 className="mb-2 text-sm font-semibold text-primary">NOW</h3>
          <p className="text-lg font-bold">{nowTask.title}</p>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-primary">{formatTime(secondsLeft)}</span>
              <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
            <div className="flex gap-2 pt-2">
              <Button size="sm" onClick={handleStart} disabled={isActive || secondsLeft === 0}>
                <Play className="mr-2 h-4 w-4" /> Start
              </Button>
              <Button size="sm" variant="outline" onClick={handleComplete}>
                <ArrowRight className="mr-2 h-4 w-4" /> Next
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        <div className="rounded-lg bg-secondary/50 p-4">
          <h3 className="mb-2 text-sm font-semibold text-muted-foreground">NEXT</h3>
          <p className="text-lg font-medium text-muted-foreground">{nextTask.title}</p>
        </div>
      </CardContent>
    </Card>
  );
}
