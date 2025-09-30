import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Bar as RechartsBar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp } from "lucide-react";

type StatsPanelProps = {
  name?: string;
};

const dailyData = {
  tasksCompleted: 5,
  focusHours: 2.5,
  tasks: [
    "Finish Q3 report",
    "Call plumber about leak",
    "Plan next week's meals",
    "Book flights for vacation",
    "Respond to non-critical emails",
  ],
};

const weeklyData = {
  totalTasks: 29,
  totalFocusHours: 18.5,
  chartData: [
    { day: "Mon", tasks: 4 },
    { day: "Tue", tasks: 6 },
    { day: "Wed", tasks: 3 },
    { day: "Thu", tasks: 8 },
    { day: "Fri", tasks: 5 },
    { day: "Sat", tasks: 2 },
    { day: "Sun", tasks: 1 },
  ],
};

const monthlyData = {
  totalTasks: 124,
  totalFocusHours: 75,
  chartData: [
    { week: "Week 1", tasks: 32 },
    { week: "Week 2", tasks: 28 },
    { week: "Week 3", tasks: 35 },
    { week: "Week 4", tasks: 29 },
  ],
};

export default function StatsPanel({ name = "Stats Panel" }: StatsPanelProps) {
  return (
    <Card className="flex h-full flex-col border-0 bg-transparent shadow-none">
      <CardHeader>
        <div className="flex items-center gap-3">
          <TrendingUp className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>Your productivity at a glance.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col">
        <Tabs defaultValue="weekly" className="flex flex-1 flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="mt-4 flex-1">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold">{dailyData.tasksCompleted}</p>
                  <p className="text-xs text-muted-foreground">Tasks Completed</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">{dailyData.focusHours}h</p>
                  <p className="text-xs text-muted-foreground">Focus Hours</p>
                </div>
              </div>
              <div>
                <h4 className="mb-2 text-sm font-semibold">Today's Accomplishments</h4>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  {dailyData.tasks.map((task) => (
                    <li key={task}>{task}</li>
                  ))}
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="weekly" className="mt-4 flex-1">
            <div className="mb-4 grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold">{weeklyData.totalTasks}</p>
                <p className="text-xs text-muted-foreground">Total Tasks</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{weeklyData.totalFocusHours}h</p>
                <p className="text-xs text-muted-foreground">Total Focus</p>
              </div>
            </div>
            <div className="h-48 flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData.chartData}>
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
          </TabsContent>

          <TabsContent value="monthly" className="mt-4 flex-1">
            <div className="mb-4 grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold">{monthlyData.totalTasks}</p>
                <p className="text-xs text-muted-foreground">Total Tasks</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{monthlyData.totalFocusHours}h</p>
                <p className="text-xs text-muted-foreground">Total Focus</p>
              </div>
            </div>
            <div className="h-48 flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData.chartData}>
                  <XAxis
                    dataKey="week"
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
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
