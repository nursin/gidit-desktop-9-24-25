import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Rocket } from "lucide-react";

type LaunchButtonProps = {
  name?: string;
};

export default function LaunchButton({ name = "Launch Button" }: LaunchButtonProps) {
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (countdown === null || countdown === 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setCountdown((prev) => (prev === null ? null : Math.max(prev - 1, 0)));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [countdown]);

  const startCountdown = () => {
    setCountdown(5);
  };

  const resetCountdown = () => {
    setCountdown(null);
  };

  const isCountingDown = countdown !== null && countdown > 0;
  const isLaunched = countdown === 0;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Rocket className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>A countdown to begin your task.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-grow flex-col items-center justify-center gap-4">
        <div
          className={cn(
            "relative flex h-40 w-40 items-center justify-center transition-all duration-300",
            isCountingDown && "scale-110",
            isLaunched && "scale-125",
          )}
        >
          {isCountingDown ? (
            <div className="absolute text-8xl font-bold text-primary opacity-75 animate-ping">
              {countdown}
            </div>
          ) : null}
          {isLaunched ? (
            <div className="absolute text-6xl font-bold text-green-500 animate-pulse">GO!</div>
          ) : null}
          <Button
            className="h-40 w-40 rounded-full text-2xl font-bold"
            onClick={startCountdown}
            disabled={isCountingDown}
          >
            {isLaunched ? <Rocket className="h-16 w-16" /> : "LAUNCH"}
          </Button>
        </div>
        {isLaunched ? (
          <Button variant="outline" size="sm" onClick={resetCountdown}>
            Reset
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
