import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  Loader2,
  LogIn,
  ShieldCheck,
  Timer,
  XCircle,
} from "lucide-react";

const FOCUS_DURATIONS = [15, 25, 45, 60, 90] as const;

type FocusModeProps = {
  name?: string;
};

const DEFAULT_MINUTES = 25;

export default function FocusMode({ name = "Focus Mode" }: FocusModeProps) {
  const [duration, setDuration] = useState(DEFAULT_MINUTES * 60);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const progress = useMemo(() => {
    if (duration === 0) {
      return 0;
    }
    return ((duration - timeLeft) / duration) * 100;
  }, [duration, timeLeft]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleSessionEnd = useCallback(
    (endReason: "completed" | "exited" | "cancelled") => {
      setIsActive(false);
      setSessionEnded(true);
      clearTimer();

      if (typeof document !== "undefined" && document.fullscreenElement) {
        void document.exitFullscreen();
      }

      switch (endReason) {
        case "completed":
          setReason("You successfully completed the focus session!");
          break;
        case "exited":
          setReason("Focus session ended because you exited fullscreen mode.");
          break;
        case "cancelled":
          setReason("Focus session cancelled.");
          break;
      }
    },
    [clearTimer],
  );

  const startTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearTimer();
          handleSessionEnd("completed");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimer, handleSessionEnd]);

  const resetState = useCallback(() => {
    setSessionEnded(false);
    setIsLoading(false);
    setTimeLeft(duration);
    setReason("");
  }, [duration]);

  const handleEnterFullscreen = useCallback(async () => {
    try {
      if (typeof document === "undefined") {
        throw new Error("Fullscreen not available in this environment.");
      }

      await document.documentElement.requestFullscreen();
      setIsLoading(false);
      setTimeLeft(duration);
      setSessionEnded(false);
      setIsActive(true);
      startTimer();
    } catch (error) {
      window.alert(
        "Could not enter fullscreen mode. This feature may not be supported by your environment.",
      );
      setIsLoading(false);
    }
  }, [duration, startTimer]);

  const handleStartClick = useCallback(() => {
    setIsLoading(true);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isActive) {
        handleSessionEnd("exited");
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && isActive) {
        handleSessionEnd("exited");
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [handleSessionEnd, isActive]);

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(duration);
    }
  }, [duration, isActive]);

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }, []);

  if (isActive) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background p-8">
        <Timer className="mb-4 h-16 w-16 text-primary" />
        <h1 className="mb-4 text-6xl font-bold font-mono">{formatTime(timeLeft)}</h1>
        <Progress value={progress} className="mb-8 w-full max-w-md" />
        <Button variant="destructive" onClick={() => handleSessionEnd("cancelled")}>
          <XCircle className="mr-2 h-4 w-4" />
          End Session
        </Button>
        <p className="mt-8 max-w-sm text-center text-sm text-muted-foreground">
          To maintain focus, leaving fullscreen or switching tabs will automatically end the
          session.
        </p>
      </div>
    );
  }

  return (
    <Card className="flex h-full flex-col border-0 bg-transparent shadow-none">
      <CardHeader>
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>Lock in and minimize distractions.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-grow flex-col items-center justify-center gap-6 text-center">
        {sessionEnded ? (
          <>
            <AlertTriangle className="h-12 w-12 text-primary" />
            <p className="font-semibold">{reason}</p>
            <Button onClick={resetState}>New Session</Button>
          </>
        ) : isLoading ? (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="font-semibold">Preparing Focus Mode...</p>
            <Button size="lg" onClick={handleEnterFullscreen}>
              <LogIn className="mr-2 h-4 w-4" />
              Click to Enter Fullscreen
            </Button>
            <Button variant="ghost" size="sm" onClick={resetState}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <p className="font-medium">Duration:</p>
              <Select
                onValueChange={(value) => setDuration(Number(value) * 60)}
                defaultValue={String(duration / 60)}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Duration" />
                </SelectTrigger>
                <SelectContent>
                  {FOCUS_DURATIONS.map((minutes) => (
                    <SelectItem key={minutes} value={String(minutes)}>
                      {minutes} minutes
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button size="lg" onClick={handleStartClick}>
              <LogIn className="mr-2 h-4 w-4" />
              Start Focus Session
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
