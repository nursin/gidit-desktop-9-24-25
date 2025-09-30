import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Bar,
  BarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CaseUpper,
  Flag,
  Plus,
  Target,
  Trash2,
} from "lucide-react";
import { addDays, differenceInDays, format, startOfDay } from "date-fns";
import { v4 as uuidv4 } from "uuid";

type Task = {
  id: string;
  name: string;
  startDate: Date;
  duration: number;
  completed: boolean;
};

type Goal = {
  id: string;
  text: string;
};

type ProjectPlannerProps = {
  name?: string;
};

type ChartDatum = {
  name: string;
  offset: number;
  duration: number;
  completed: boolean;
};

const today = startOfDay(new Date());

const initialTasks: Task[] = [
  {
    id: uuidv4(),
    name: "Project Kick-off & Planning",
    startDate: today,
    duration: 3,
    completed: true,
  },
  {
    id: uuidv4(),
    name: "UI/UX Design Mockups",
    startDate: addDays(today, 2),
    duration: 5,
    completed: false,
  },
  {
    id: uuidv4(),
    name: "Frontend Development",
    startDate: addDays(today, 6),
    duration: 10,
    completed: false,
  },
  {
    id: uuidv4(),
    name: "Backend API Integration",
    startDate: addDays(today, 10),
    duration: 8,
    completed: false,
  },
  {
    id: uuidv4(),
    name: "User Testing & Feedback",
    startDate: addDays(today, 18),
    duration: 4,
    completed: false,
  },
  {
    id: uuidv4(),
    name: "Deployment",
    startDate: addDays(today, 22),
    duration: 2,
    completed: false,
  },
];

const initialGoals: Goal[] = [
  { id: uuidv4(), text: "Launch MVP by the end of the quarter." },
  { id: uuidv4(), text: "Achieve 90% user satisfaction in beta testing." },
];

export default function ProjectPlanner({ name = "Project Planner" }: ProjectPlannerProps) {
  const [projectName, setProjectName] = useState("New Website Launch");
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [goals] = useState<Goal[]>(initialGoals);
  const [newTaskName, setNewTaskName] = useState("");

  const chartData = useMemo<ChartDatum[]>(
    () =>
      tasks.map((task) => ({
        name: task.name,
        offset: Math.max(0, differenceInDays(task.startDate, today)),
        duration: task.duration,
        completed: task.completed,
      })),
    [tasks],
  );

  const completedTasks = useMemo(() => tasks.filter((task) => task.completed).length, [tasks]);
  const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  const handleAddTask = () => {
    if (!newTaskName.trim()) {
      return;
    }
    const lastTask = tasks.at(-1);
    const nextStart = lastTask ? addDays(lastTask.startDate, lastTask.duration) : today;
    const newTask: Task = {
      id: uuidv4(),
      name: newTaskName,
      startDate: nextStart,
      duration: 3,
      completed: false,
    };
    setTasks((prev) => [...prev, newTask]);
    setNewTaskName("");
  };

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)),
    );
  };

  const handleRemoveTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const ganttDomainEnd = useMemo(() => {
    const maxEnd = tasks.reduce((acc, task) => {
      const end = differenceInDays(addDays(task.startDate, task.duration), today);
      return Math.max(acc, end);
    }, 30);
    return Math.max(30, maxEnd + 2);
  }, [tasks]);

  return (
    <Card className="flex h-full flex-col border-0 bg-transparent shadow-none">
      <CardHeader>
        <div className="flex items-center gap-3">
          <CaseUpper className="h-6 w-6 text-primary" />
          <div>
            <Input
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              className="h-auto border-none p-0 text-2xl font-semibold leading-none tracking-tight focus-visible:ring-0"
            />
            <CardDescription>Track your project from start to finish.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-4">
        <div>
          <div className="mb-1 flex items-baseline justify-between">
            <h4 className="text-sm font-semibold">Overall Progress</h4>
            <p className="text-sm text-muted-foreground">
              {completedTasks} / {tasks.length} tasks
            </p>
          </div>
          <Progress value={progress} />
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 5, right: 20, left: 140, bottom: 5 }}
            >
              <XAxis
                type="number"
                domain={[0, ganttDomainEnd]}
                tickFormatter={(value) => `Day ${value}`}
              />
              <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
                formatter={(value, _name, tooltipPayload) => {
                  if (tooltipPayload?.dataKey === "offset") {
                    return null;
                  }
                  const duration = tooltipPayload?.payload?.duration ?? value;
                  return [`Duration: ${duration} days`, ""];
                }}
              />
              <ReferenceLine x={0} stroke="hsl(var(--destructive))" strokeDasharray="3 3" />
              <Bar dataKey="offset" stackId="project" fill="transparent" isAnimationActive={false} />
              <Bar
                dataKey="duration"
                stackId="project"
                shape={(barProps) => {
                  const props = barProps as unknown as {
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                    payload: ChartDatum;
                  };
                  const { x, y, width, height, payload } = props;
                  return (
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      rx={4}
                      fill={payload.completed ? "hsl(var(--primary) / 0.5)" : "hsl(var(--primary))"}
                    />
                  );
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid flex-1 min-h-0 grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <h4 className="flex items-center gap-2 font-semibold">
              <Target className="h-4 w-4" /> Goals
            </h4>
            <div className="flex-1 rounded-lg bg-background/50 p-3">
              <ul className="space-y-2 text-sm">
                {goals.map((goal) => (
                  <li key={goal.id} className="flex items-start gap-2">
                    <Flag className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                    <span>{goal.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex min-h-0 flex-col gap-2">
            <h4 className="font-semibold">Tasks</h4>
            <div className="flex gap-2">
              <Input
                placeholder="Add a new task..."
                value={newTaskName}
                onChange={(event) => setNewTaskName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleAddTask();
                  }
                }}
              />
              <Button onClick={handleAddTask} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="-mx-3 flex-1">
              <div className="space-y-2 px-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 rounded-md bg-background/50 p-2"
                  >
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => handleToggleTask(task.id)}
                    />
                    <label
                      className={cn(
                        "flex-1 text-sm",
                        task.completed && "line-through text-muted-foreground",
                      )}
                    >
                      {task.name}
                    </label>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleRemoveTask(task.id)}
                    >
                      <Trash2 className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
