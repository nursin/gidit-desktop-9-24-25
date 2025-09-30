import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { CheckCircle2, Trophy } from "lucide-react";

type Filter = "today" | "week" | "all";

type CompletedTask = {
  id: number;
  title: string;
  completedAt: Date;
  tags: string[];
};

const allCompletedTasks: CompletedTask[] = [
  { id: 1, title: "Finish Q3 report", completedAt: new Date(Date.now()), tags: ["Work"] },
  { id: 2, title: "Call plumber about leak", completedAt: new Date(Date.now() - 86400000 * 1), tags: [] },
  { id: 3, title: "Plan next week's meals", completedAt: new Date(Date.now() - 86400000 * 2), tags: ["Home"] },
  { id: 4, title: "Book flights for vacation", completedAt: new Date(Date.now() - 86400000 * 3), tags: ["Travel"] },
  { id: 5, title: "Respond to non-critical emails", completedAt: new Date(Date.now() - 86400000 * 5), tags: ["Work"] },
  { id: 6, title: "Organize desktop files", completedAt: new Date(Date.now() - 86400000 * 8), tags: [] },
  { id: 7, title: "Start on new feature design", completedAt: new Date(Date.now() - 86400000 * 10), tags: ["Work"] },
];

type DoneWallProps = {
  name?: string;
};

export default function DoneWall({ name = "Wall of Completion" }: DoneWallProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const streakDays = 12;

  const filteredTasks = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(Date.now() - 7 * 86400000);

    if (filter === "today") {
      return allCompletedTasks.filter((task) => task.completedAt >= today);
    }

    if (filter === "week") {
      return allCompletedTasks.filter((task) => task.completedAt >= weekAgo);
    }

    return allCompletedTasks;
  }, [filter]);

  return (
    <Card
      className={cn(
        "flex h-full flex-col",
        streakDays > 0 && "border-amber-400 shadow-lg shadow-amber-500/20",
      )}
    >
      {streakDays > 0 && (
        <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 opacity-10 blur animate-pulse" />
      )}
      <CardHeader className="relative">
        <div className="flex items-center gap-3">
          <Trophy className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>Celebrate your achievements.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative flex min-h-0 flex-grow flex-col">
        <div className="mb-4 flex justify-center gap-2">
          <Button
            size="sm"
            variant={filter === "today" ? "secondary" : "ghost"}
            onClick={() => setFilter("today")}
          >
            Today
          </Button>
          <Button
            size="sm"
            variant={filter === "week" ? "secondary" : "ghost"}
            onClick={() => setFilter("week")}
          >
            This Week
          </Button>
          <Button
            size="sm"
            variant={filter === "all" ? "secondary" : "ghost"}
            onClick={() => setFilter("all")}
          >
            All Time
          </Button>
        </div>
        <ScrollArea className="flex-grow">
          <div className="space-y-3 pr-4">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 rounded-md bg-secondary/50 p-2"
                >
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-500" />
                  <div className="flex-grow">
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Completed: {task.completedAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex-shrink-0 space-x-2">
                    {task.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="pt-8 text-center text-muted-foreground">
                No tasks completed in this period.
              </p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
