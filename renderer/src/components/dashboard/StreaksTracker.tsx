import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Flame } from "lucide-react";

type StreaksTrackerProps = {
  name?: string;
  streakCount?: number;
};

export default function StreaksTracker({
  name = "Daily Streak",
  streakCount = 12,
}: StreaksTrackerProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Flame className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>Keep the fire alive!</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex items-center justify-center gap-4">
        <Flame className="h-16 w-16 text-orange-500" />
        <div className="text-center">
          <p className="text-6xl font-bold text-primary">{streakCount}</p>
          <p className="text-muted-foreground">days</p>
        </div>
      </CardContent>
    </Card>
  );
}
