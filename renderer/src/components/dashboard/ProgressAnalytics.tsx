import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import {
  Bar as RechartsBar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ProgressAnalyticsProps = {
  name?: string;
};

type WeeklyCompletion = {
  day: string;
  tasks: number;
};

const weeklyCompletions: WeeklyCompletion[] = [
  { day: "Mon", tasks: 4 },
  { day: "Tue", tasks: 6 },
  { day: "Wed", tasks: 3 },
  { day: "Thu", tasks: 8 },
  { day: "Fri", tasks: 5 },
  { day: "Sat", tasks: 2 },
  { day: "Sun", tasks: 1 },
];

export default function ProgressAnalytics({ name = "Progress Analytics" }: ProgressAnalyticsProps) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-center gap-3">
          <TrendingUp className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>Visualize your productivity trends.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-grow flex-col gap-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">29</p>
            <p className="text-xs text-muted-foreground">Tasks Completed</p>
          </div>
          <div>
            <p className="text-2xl font-bold">18</p>
            <p className="text-xs text-muted-foreground">Focus Blocks</p>
          </div>
          <div>
            <p className="text-2xl font-bold">7.5h</p>
            <p className="text-xs text-muted-foreground">Time Audited</p>
          </div>
        </div>
        <div className="h-48 flex-grow">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyCompletions}>
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
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <RechartsBar dataKey="tasks" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
