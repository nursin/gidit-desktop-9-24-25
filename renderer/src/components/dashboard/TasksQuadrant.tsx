import type { ReactNode } from "react";
import { useState } from "react";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  type DragEndEvent,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Briefcase, Calendar, GripVertical, ListTodo } from "lucide-react";

export type QuadrantId = "q1" | "q2" | "q3" | "q4";

export type Task = {
  id: string;
  label: string;
  quadrantId: QuadrantId;
  tags: { name: string; icon: ReactNode }[];
};

type TasksQuadrantProps = {
  name?: string;
};

const initialTasks: Task[] = [
  {
    id: "t1",
    quadrantId: "q1",
    label: "Finish Q3 report",
    tags: [{ name: "Work", icon: <Briefcase className="h-3 w-3" /> }],
  },
  {
    id: "t2",
    quadrantId: "q1",
    label: "Call plumber about leak",
    tags: [],
  },
  {
    id: "t3",
    quadrantId: "q2",
    label: "Plan next week's meals",
    tags: [],
  },
  {
    id: "t4",
    quadrantId: "q2",
    label: "Book flights for vacation",
    tags: [{ name: "Travel", icon: <Calendar className="h-3 w-3" /> }],
  },
  {
    id: "t5",
    quadrantId: "q2",
    label: "Start on new feature design",
    tags: [{ name: "Work", icon: <Briefcase className="h-3 w-3" /> }],
  },
  {
    id: "t6",
    quadrantId: "q3",
    label: "Respond to non-critical emails",
    tags: [{ name: "Work", icon: <Briefcase className="h-3 w-3" /> }],
  },
  {
    id: "t7",
    quadrantId: "q4",
    label: "Organize desktop files",
    tags: [],
  },
];

const quadrantStyles: Record<QuadrantId, string> = {
  q1: "bg-red-500/10",
  q2: "bg-blue-500/10",
  q3: "bg-yellow-500/10",
  q4: "bg-gray-500/10",
};

function DraggableTask({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });

  return (
    <div
      ref={setNodeRef}
      style={transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined}
      className={cn(
        "flex items-center gap-2 rounded-md bg-background/80 p-2 text-sm shadow",
        isDragging && "opacity-50",
      )}
      {...attributes}
      {...listeners}
    >
      <GripVertical className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
      <span className="line-clamp-2 flex-1">{task.label}</span>
      {task.tags.map((tag) => (
        <Badge key={tag.name} variant="secondary" className="flex items-center gap-1 text-xs">
          {tag.icon}
          {tag.name}
        </Badge>
      ))}
    </div>
  );
}

function Quadrant({ quadrantId, tasks }: { quadrantId: QuadrantId; tasks: Task[] }) {
  const { setNodeRef } = useDroppable({ id: quadrantId });

  return (
    <div
      ref={setNodeRef}
      className={cn("min-h-[150px] space-y-3 rounded-lg p-4", quadrantStyles[quadrantId])}
    >
      {tasks.map((task) => (
        <DraggableTask key={task.id} task={task} />
      ))}
    </div>
  );
}

export default function TasksQuadrant({ name = "Task Quadrants" }: TasksQuadrantProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const handleDragStart = (event: { active: { data: { current?: { task?: Task } } } }) => {
    const maybeTask = event.active.data.current?.task;
    setActiveTask(maybeTask ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) {
      return;
    }

    setTasks((prev) =>
      prev.map((task) =>
        task.id === active.id ? { ...task, quadrantId: over.id as QuadrantId } : task,
      ),
    );
  };

  return (
    <Card className="flex h-full flex-col border-0 bg-transparent shadow-none">
      <CardHeader>
        <div className="flex items-center gap-3">
          <ListTodo className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>Prioritize what truly matters by dragging tasks.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid h-full grid-cols-[auto,1fr,1fr] grid-rows-[auto,1fr,1fr] gap-4">
            <div />
            <div className="flex items-center justify-center text-sm font-bold text-muted-foreground">
              Urgent
            </div>
            <div className="flex items-center justify-center text-sm font-bold text-muted-foreground">
              Not Urgent
            </div>

            <div className="flex items-center justify-center [writing-mode:vertical-rl] rotate-180 text-sm font-bold text-muted-foreground">
              Important
            </div>
            <Quadrant quadrantId="q1" tasks={tasks.filter((task) => task.quadrantId === "q1")} />
            <Quadrant quadrantId="q2" tasks={tasks.filter((task) => task.quadrantId === "q2")} />

            <div className="flex items-center justify-center [writing-mode:vertical-rl] rotate-180 text-sm font-bold text-muted-foreground">
              Not Important
            </div>
            <Quadrant quadrantId="q3" tasks={tasks.filter((task) => task.quadrantId === "q3")} />
            <Quadrant quadrantId="q4" tasks={tasks.filter((task) => task.quadrantId === "q4")} />
          </div>
          <DragOverlay>{activeTask ? <DraggableTask task={activeTask} /> : null}</DragOverlay>
        </DndContext>
      </CardContent>
    </Card>
  );
}
