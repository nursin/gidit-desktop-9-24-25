'use client';

import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Bold,
  FileType,
  Italic,
  List,
  ListOrdered,
  Redo,
  Strikethrough,
  Underline,
  Undo,
} from "lucide-react";

type WordProcessorProps = {
  name?: string;
};

export default function WordProcessor({ name = "Word Processor" }: WordProcessorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);

  const execCmd = (command: string) => {
    document.execCommand(command, false);
    editorRef.current?.focus();
  };

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML.trim().length === 0) {
      editorRef.current.innerHTML = '<p>Start typing your document here...</p>';
    }
  }, []);

  return (
    <Card className="flex h-full flex-col border-0 bg-transparent shadow-none">
      <CardHeader>
        <div className="flex items-center gap-3">
          <FileType className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>A simple rich text editor.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-1 rounded-md border bg-background/50 p-2">
          <Button variant="outline" size="icon" onClick={() => execCmd('undo')}>
            <Undo className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => execCmd('redo')}>
            <Redo className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <Button variant="outline" size="icon" onClick={() => execCmd('bold')}>
            <Bold className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => execCmd('italic')}>
            <Italic className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => execCmd('underline')}>
            <Underline className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => execCmd('strikeThrough')}>
            <Strikethrough className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <Button variant="outline" size="icon" onClick={() => execCmd('insertUnorderedList')}>
            <List className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => execCmd('insertOrderedList')}>
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-auto rounded-md border bg-background p-4">
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            className="prose max-w-none focus:outline-none dark:prose-invert"
          />
        </div>
      </CardContent>
    </Card>
  );
}
