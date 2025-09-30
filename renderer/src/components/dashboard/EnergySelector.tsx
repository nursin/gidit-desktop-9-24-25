import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  BatteryCharging,
  BatteryFull,
  BatteryLow,
  BatteryMedium,
} from "lucide-react";

type EnergyLevel = {
  level: "low" | "medium" | "high";
  label: string;
  icon: typeof BatteryLow;
};

const energyLevels: EnergyLevel[] = [
  { level: "low", label: "Low", icon: BatteryLow },
  { level: "medium", label: "Medium", icon: BatteryMedium },
  { level: "high", label: "High", icon: BatteryFull },
];

type EnergySelectorProps = {
  name?: string;
};

export default function EnergySelector({ name = "Energy Selector" }: EnergySelectorProps) {
  const [selectedEnergy, setSelectedEnergy] = useState<EnergyLevel["level"] | null>(null);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-center gap-3">
          <BatteryCharging className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>Filter tasks by your current energy.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-grow flex-col items-center justify-center gap-4">
        <p className="text-sm text-muted-foreground">What&apos;s your energy level?</p>
        <div className="flex w-full max-w-xs items-center justify-around">
          {energyLevels.map(({ level, label, icon: Icon }) => (
            <Button
              key={level}
              variant={selectedEnergy === level ? "secondary" : "ghost"}
              className={cn(
                "flex h-20 w-20 flex-col gap-2 border",
                selectedEnergy === level && "border-primary",
              )}
              onClick={() => setSelectedEnergy(level)}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
