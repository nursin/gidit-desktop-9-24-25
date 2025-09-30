import { useEffect, useMemo, useRef, useState } from "react";

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
import { arrayMove } from "@dnd-kit/sortable";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { GripVertical, KanbanSquare, Palette, Plus, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

type Task = {
  id: string;
  content: string;
  columnId: string;
};

type Column = {
  id: string;
  title: string;
  color: string;
};

type ScrumBoardProps = {
  name?: string;
};

const defaultColumns: Column[] = [
  { id: "backlog", title: "Backlog", color: "#71717a" },
  { id: "todo", title: "To Do", color: "#3b82f6" },
  { id: "in-progress", title: "In Progress", color: "#eab308" },
  { id: "done", title: "Done", color: "#22c55e" },
];

const initialTasks: Task[] = [
  { id: uuidv4(), columnId: "backlog", content: "Design new landing page" },
  { id: uuidv4(), columnId: "backlog", content: "Research state management libraries" },
  { id: uuidv4(), columnId: "todo", content: "Implement user authentication" },
  { id: uuidv4(), columnId: "in-progress", content: "Develop API for user profiles" },
  { id: uuidv4(), columnId: "done", content: "Set up CI/CD pipeline" },
];

export default function ScrumBoard({ name = "Scrum Board" }: ScrumBoardProps) {
  const [columns, setColumns] = useState<Column[]>(defaultColumns);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const activeTask = useMemo(
    () => tasks.find((task) => task.id === activeTaskId) ?? null,
    [activeTaskId, tasks],
  );

  const handleDragStart = (event: { active: { data: { current?: unknown }; id: string } }) => {
    const data = event.active.data.current as { type?: string; task?: Task } | undefined;
    if (data?.type === "Task" && data.task) {
      setActiveTaskId(data.task.id);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTaskId(null);
    const { active, over } = event;
    if (!over) {
      return;
    }

    const activeData = active.data.current as { type?: string } | undefined;
    const overData = over.data.current as { type?: string } | undefined;
    if (activeData?.type !== "Task" || overData?.type !== "Column") {
      return;
    }

    const overColumnId = String(over.id);
    setTasks((prev) =>
      prev.map((task) => (task.id === active.id ? { ...task, columnId: overColumnId } : task)),
    );
  };

  const handleTitleChange = (id: string, newTitle: string) => {
    setColumns((prev) => prev.map((column) => (column.id === id ? { ...column, title: newTitle } : column)));
  };

  const handleColorChange = (id: string, newColor: string) => {
    setColumns((prev) => prev.map((column) => (column.id === id ? { ...column, color: newColor } : column)));
  };

  const handleAddTask = (columnId: string, content: string) => {
    setTasks((prev) => [...prev, { id: uuidv4(), columnId, content }]);
  };

  const handleAddColumn = () => {
    setColumns((prev) => [
      ...prev,
      { id: uuidv4(), title: "New Column", color: "#a1a1aa" },
    ]);
  };

  const handleDeleteColumn = (id: string) => {
    setColumns((prev) => prev.filter((column) => column.id !== id));
    setTasks((prev) => prev.filter((task) => task.columnId !== id));
  };

  return (
    <Card className="flex h-full flex-col border-0 bg-transparent shadow-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <KanbanSquare className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>{name}</CardTitle>
              <CardDescription>Organize your project workflow.</CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleAddColumn}>
            <Plus className="mr-2 h-4 w-4" /> Add Column
          </Button>
        </div>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 p-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div
            className="grid h-full gap-4"
            style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
          >
            {columns.map((column) => (
              <ColumnContainer
                key={column.id}
                column={column}
                tasks={tasks.filter((task) => task.columnId === column.id)}
                onTitleChange={handleTitleChange}
                onAddTask={handleAddTask}
                onDeleteColumn={handleDeleteColumn}
                onColorChange={handleColorChange}
              />
            ))}
          </div>
          <DragOverlay>{activeTask ? <TaskCard task={activeTask} /> : null}</DragOverlay>
        </DndContext>
      </CardContent>
    </Card>
  );
}

type TaskCardProps = {
  task: Task;
};

function TaskCard({ task }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { type: "Task", task },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-lg bg-background/80 p-3 shadow", 
        isDragging && "opacity-50",
      )}
    >
      <div {...attributes} {...listeners} className="cursor-grab touch-none">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="flex-1 text-sm">{task.content}</p>
    </div>
  );
}

type AddTaskFormProps = {
  columnId: string;
  onAddTask: (columnId: string, content: string) => void;
  onCancel: () => void;
};

function AddTaskForm({ columnId, onAddTask, onCancel }: AddTaskFormProps) {
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleAddTask = () => {
    if (!content.trim()) {
      return;
    }
    onAddTask(columnId, content.trim());
    setContent("");
    onCancel();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleAddTask();
    }
    if (event.key === "Escape") {
      onCancel();
    }
  };

  return (
    <div className="space-y-2">
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={(event) => setContent(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter a title for this card..."
        className="h-20 resize-none text-sm"
      />
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={handleAddTask}>
          Add card
        </Button>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

type ColumnContainerProps = {
  column: Column;
  tasks: Task[];
  onTitleChange: (id: string, newTitle: string) => void;
  onAddTask: (columnId: string, content: string) => void;
  onDeleteColumn: (id: string) => void;
  onColorChange: (id: string, newColor: string) => void;
};

function ColumnContainer({
  column,
  tasks,
  onTitleChange,
  onAddTask,
  onDeleteColumn,
  onColorChange,
}: ColumnContainerProps) {
  const { setNodeRef } = useDroppable({ id: column.id, data: { type: "Column" } });
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [title, setTitle] = useState(column.title);

  useEffect(() => {
    setTitle(column.title);
  }, [column.title]);

  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const handleTitleBlur = () => {
    onTitleChange(column.id, title.trim() || column.title);
    setIsEditing(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleTitleBlur();
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div
        ref={setNodeRef}
        className="flex h-full flex-col gap-3 rounded-lg p-4"
        style={{ backgroundColor: hexToRgba(column.color, 0.2) }}
      >
        <div className="flex items-center gap-2 text-sm font-semibold">
          {isEditing ? (
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={handleKeyDown}
              autoFocus
              className="h-7 text-sm"
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex-1 cursor-pointer truncate text-left"
            >
              {column.title}
            </button>
          )}
          <Badge variant="secondary">{tasks.length}</Badge>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Palette className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-24 p-2" align="end">
              <Input
                type="color"
                value={column.color}
                onChange={(event) => onColorChange(column.id, event.target.value)}
                className="h-8 p-1"
              />
            </PopoverContent>
          </Popover>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Trash2 className="h-3 w-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete column?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the column and all tasks inside it.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDeleteColumn(column.id)}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="flex flex-1 flex-col gap-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>

        {isAddingTask ? (
          <AddTaskForm
            columnId={column.id}
            onAddTask={onAddTask}
            onCancel={() => setIsAddingTask(false)}
          />
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => setIsAddingTask(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> Add a card
          </Button>
        )}
      </div>
    </div>
  );
}
