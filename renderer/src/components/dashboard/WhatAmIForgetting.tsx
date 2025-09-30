'use client';

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  generateForgettingSuggestions,
  type GenerateForgettingSuggestionsOutput,
} from "@/lib/ai/flows/GenerateForgettingSuggestions";
import { HelpCircle, Lightbulb, Loader2 } from "lucide-react";

type WhatAmIForgettingProps = {
  name?: string;
};

type Suggestion = GenerateForgettingSuggestionsOutput["suggestions"][number] & {
  checked: boolean;
};

export default function WhatAmIForgetting({
  name = "What Am I Forgetting?",
}: WhatAmIForgettingProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isPending, startTransition] = useTransition();

  const handleGenerate = () => {
    startTransition(async () => {
      setSuggestions([]);
      const result = await generateForgettingSuggestions();
      setSuggestions(result.suggestions.map((item) => ({ ...item, checked: false })));
    });
  };

  const handleToggle = (index: number) => {
    setSuggestions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], checked: !next[index].checked };
      return next;
    });
  };

  return (
    <Card className="flex h-full flex-col border-0 bg-transparent shadow-none">
      <CardHeader>
        <div className="flex items-center gap-3">
          <HelpCircle className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>Get a quick checklist for your brain.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-4">
        <ScrollArea className="-mx-6 flex-1">
          <div className="space-y-3 px-6">
            {isPending ? (
              <>
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </>
            ) : suggestions.length ? (
              suggestions.map((item, index) => (
                <div
                  key={item.suggestion}
                  className="flex items-center space-x-2 rounded-md bg-background/50 p-2"
                >
                  <Checkbox
                    id={`item-${index}`}
                    checked={item.checked}
                    onCheckedChange={() => handleToggle(index)}
                  />
                  <label
                    htmlFor={`item-${index}`}
                    className="flex-grow text-sm font-medium leading-none"
                  >
                    {item.suggestion}
                  </label>
                  <Badge variant="outline">{item.category}</Badge>
                </div>
              ))
            ) : (
              <div className="pt-12 text-center text-muted-foreground">
                <p>Click the button to generate a list of things you might be forgetting.</p>
              </div>
            )}
          </div>
        </ScrollArea>
        <Button onClick={handleGenerate} disabled={isPending}>
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Lightbulb className="mr-2 h-4 w-4" />
          )}
          Generate Checklist
        </Button>
      </CardContent>
    </Card>
  );
}
