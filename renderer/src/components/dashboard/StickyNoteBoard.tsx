import { useCallback, useMemo, useState } from "react";

import {
  DndContext,
  type DragEndEvent,
  useDraggable,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Clipboard, Plus, X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

const COLORS = [
  "bg-yellow-200",
  "bg-blue-200",
  "bg-green-200",
  "bg-pink-200",
  "bg-purple-200",
];

const NOTE_MIN_WIDTH = 180;
const NOTE_MIN_HEIGHT = 180;
const NOTE_WIDTH = 192;
const NOTE_HEIGHT = 192;
const PLACEMENT_OFFSET = 24;

export type StickyNote = {
  id: string;
  content: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  color: string;
};

type StickyNoteBoardProps = {
  name?: string;
};

export default function StickyNoteBoard({ name = "Sticky Note Board" }: StickyNoteBoardProps) {
  const [notes, setNotes] = useState<StickyNote[]>([]);

  const addNote = useCallback(() => {
    let position = { x: PLACEMENT_OFFSET, y: PLACEMENT_OFFSET };
    const newId = uuidv4();
    const testNote: StickyNote = {
      id: newId,
      content: "",
      position,
      size: { width: NOTE_WIDTH, height: NOTE_HEIGHT },
      color: COLORS[notes.length % COLORS.length],
    };

    const overlaps = (candidate: StickyNote) =>
      notes.some((existing) =>
        candidate.position.x < existing.position.x + existing.size.width &&
        candidate.position.x + candidate.size.width > existing.position.x &&
        candidate.position.y < existing.position.y + existing.size.height &&
        candidate.position.y + candidate.size.height > existing.position.y,
      );

    while (overlaps({ ...testNote, position })) {
      position = { x: position.x + PLACEMENT_OFFSET, y: position.y + PLACEMENT_OFFSET };
    }

    setNotes((prev) => [
      ...prev,
      {
        ...testNote,
        position,
      },
    ]);
  }, [notes]);

  const updateNoteContent = useCallback((id: string, content: string) => {
    setNotes((prev) => prev.map((note) => (note.id === id ? { ...note, content } : note)));
  }, []);

  const updateNoteSize = useCallback((id: string, size: { width: number; height: number }) => {
    setNotes((prev) => prev.map((note) => (note.id === id ? { ...note, size } : note)));
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, delta } = event;
    if (!delta) {
      return;
    }
    setNotes((prev) =>
      prev.map((note) =>
        note.id === active.id
          ? {
              ...note,
              position: {
                x: note.position.x + delta.x,
                y: note.position.y + delta.y,
              },
            }
          : note,
      ),
    );
  }, []);

  const removeNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  }, []);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clipboard className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>{name}</CardTitle>
              <CardDescription>Capture your ideas.</CardDescription>
            </div>
          </div>
          <Button size="sm" onClick={addNote}>
            <Plus className="mr-2 h-4 w-4" /> Add Note
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <DndContext onDragEnd={handleDragEnd}>
          <div className="relative h-full w-full overflow-hidden bg-secondary/20">
            {notes.map((note) => (
              <StickyNote
                key={note.id}
                note={note}
                onUpdate={updateNoteContent}
                onRemove={removeNote}
                onSizeChange={updateNoteSize}
              />
            ))}
          </div>
        </DndContext>
      </CardContent>
    </Card>
  );
}

type StickyNoteProps = {
  note: StickyNote;
  onUpdate: (id: string, content: string) => void;
  onRemove: (id: string) => void;
  onSizeChange: (id: string, size: { width: number; height: number }) => void;
};

function StickyNote({ note, onUpdate, onRemove, onSizeChange }: StickyNoteProps) {
  const [isResizing, setIsResizing] = useState(false);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: note.id,
    disabled: isResizing,
  });

  const style = useMemo(() => ({
    top: note.position.y,
    left: note.position.x,
    width: note.size.width,
    height: note.size.height,
    transform: isDragging && transform ? CSS.Translate.toString(transform) : undefined,
  }), [note.position, note.size, isDragging, transform]);

  const handleResizeStart = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsResizing(true);
      const startWidth = note.size.width;
      const startHeight = note.size.height;
      const startX = event.clientX;
      const startY = event.clientY;

      const handlePointerMove = (moveEvent: PointerEvent) => {
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;
        const width = Math.max(NOTE_MIN_WIDTH, startWidth + dx);
        const height = Math.max(NOTE_MIN_HEIGHT, startHeight + dy);
        onSizeChange(note.id, { width, height });
      };

      const handlePointerUp = () => {
        setIsResizing(false);
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
      };

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    },
    [note.id, note.size.height, note.size.width, onSizeChange],
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "absolute flex flex-col rounded-md p-2 shadow-md",
        note.color,
        isDragging && "z-20",
      )}
    >
      <div {...listeners} {...attributes} className="flex-shrink-0 cursor-grab p-1">
        <div className="h-4 w-full" />
      </div>
      <button
        type="button"
        onClick={() => onRemove(note.id)}
        className="absolute right-1 top-1 rounded-full p-0.5 hover:bg-black/10"
      >
        <X className="h-3 w-3" />
      </button>
      <Textarea
        value={note.content}
        onChange={(event) => onUpdate(note.id, event.target.value)}
        className="flex-1 resize-none border-0 bg-transparent text-sm focus-visible:ring-0"
        placeholder="Type here..."
      />
      <div
        className="absolute bottom-0 right-0 z-10 h-4 w-4 cursor-se-resize"
        onPointerDown={handleResizeStart}
      >
        <div className="absolute bottom-1 right-1 h-2 w-2 border-b-2 border-r-2 border-black/40" />
      </div>
    </div>
  );
}
