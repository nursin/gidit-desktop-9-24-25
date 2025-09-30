'use client';

import { useCallback, useEffect, useState } from "react";

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
  Drumstick,
  Frown,
  Gamepad2,
  Heart,
  PawPrint,
  RotateCcw,
  Skull,
  Smile,
} from "lucide-react";

const MAX_STAT = 100;
const DECAY_RATE = 2;
const TICK_INTERVAL = 2_000;

type VirtualPetProps = {
  name?: string;
};

export default function VirtualPet({ name = "Virtual Pet" }: VirtualPetProps) {
  const [hunger, setHunger] = useState<number>(MAX_STAT);
  const [happiness, setHappiness] = useState<number>(MAX_STAT);
  const [isAlive, setIsAlive] = useState<boolean>(true);

  const decayStats = useCallback(() => {
    setHunger((value) => Math.max(0, value - DECAY_RATE));
    setHappiness((value) => Math.max(0, value - DECAY_RATE));
  }, []);

  useEffect(() => {
    if (!isAlive) {
      return undefined;
    }
    const timer = setInterval(decayStats, TICK_INTERVAL);
    return () => clearInterval(timer);
  }, [decayStats, isAlive]);

  useEffect(() => {
    if ((hunger <= 0 || happiness <= 0) && isAlive) {
      setIsAlive(false);
    }
  }, [happiness, hunger, isAlive]);

  const feed = () => {
    if (!isAlive) {
      return;
    }
    setHunger((value) => Math.min(MAX_STAT, value + 20));
  };

  const play = () => {
    if (!isAlive) {
      return;
    }
    setHappiness((value) => Math.min(MAX_STAT, value + 15));
  };

  const restart = () => {
    setIsAlive(true);
    setHunger(MAX_STAT);
    setHappiness(MAX_STAT);
  };

  const petIcon = (() => {
    if (!isAlive) {
      return <Skull className="h-16 w-16 text-gray-500" />;
    }
    if (happiness > 60) {
      return <Smile className="h-16 w-16 text-green-500" />;
    }
    return <Frown className="h-16 w-16 text-yellow-500" />;
  })();

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PawPrint className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>{name}</CardTitle>
              <CardDescription>Keep your digital friend happy!</CardDescription>
            </div>
          </div>
          {!isAlive ? (
            <Button variant="ghost" size="icon" onClick={restart}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col items-center justify-center gap-4">
        <div className="flex h-24 w-24 items-center justify-center">{petIcon}</div>
        {isAlive ? (
          <>
            <div className="w-full space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3" /> Hunger
                  </span>
                  <span>{hunger}%</span>
                </div>
                <Progress value={hunger} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3" /> Happiness
                  </span>
                  <span>{happiness}%</span>
                </div>
                <Progress value={happiness} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={feed}>
                <Drumstick className="mr-2 h-4 w-4" /> Feed
              </Button>
              <Button variant="outline" onClick={play}>
                <Gamepad2 className="mr-2 h-4 w-4" /> Play
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <p className="font-bold text-destructive">Your pet has left.</p>
            <p className="text-sm text-muted-foreground">Try again by restarting.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
