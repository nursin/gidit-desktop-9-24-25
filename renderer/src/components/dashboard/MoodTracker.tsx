import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Angry, BarChart2, Frown, Laugh, Meh, Smile } from "lucide-react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { cn } from "@/lib/utils";

type MoodTrackerProps = {
  name?: string;
};

type MoodOption = {
  level: number;
  label: string;
  icon: JSX.Element;
};

type MoodDatum = {
  day: string;
  mood: number;
};

const moodData: MoodDatum[] = [
  { day: "Mon", mood: 4 },
  { day: "Tue", mood: 5 },
  { day: "Wed", mood: 3 },
  { day: "Thu", mood: 5 },
  { day: "Fri", mood: 4 },
  { day: "Sat", mood: 2 },
  { day: "Sun", mood: 3 },
];

const moods: MoodOption[] = [
  { level: 1, icon: <Angry className="h-8 w-8" />, label: "Awful" },
  { level: 2, icon: <Frown className="h-8 w-8" />, label: "Bad" },
  { level: 3, icon: <Meh className="h-8 w-8" />, label: "Okay" },
  { level: 4, icon: <Smile className="h-8 w-8" />, label: "Good" },
  { level: 5, icon: <Laugh className="h-8 w-8" />, label: "Great" },
];

export default function MoodTracker({ name = "Mood Tracker" }: MoodTrackerProps) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-center gap-3">
          <BarChart2 className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>Log and visualize your daily mood.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-grow flex-col gap-4">
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={moodData}>
              <XAxis
                dataKey="day"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={[0, 5]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Bar dataKey="mood" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-end justify-around pt-4">
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
                {mood.icon}
              </div>
              <span className="text-xs font-medium">{mood.label}</span>
            </button>
          ))}
        </div>
        <Button disabled={!selectedMood}>Log Today&apos;s Mood</Button>
      </CardContent>
    </Card>
  );
}
