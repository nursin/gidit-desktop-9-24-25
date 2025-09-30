import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/useToast";
import { generateStory } from "@/lib/ai/flows/StoryWriter";
import { FileText, Loader2, Sparkles } from "lucide-react";

export type StoryWriterProps = {
  name?: string;
};

export default function StoryWriter({ name = "Smart Story Writer" }: StoryWriterProps) {
  const [prompt, setPrompt] = useState("");
  const [story, setStory] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleGenerateStory = () => {
    if (!prompt.trim()) {
      toast({ title: "Enter a prompt first" });
      return;
    }

    startTransition(async () => {
      try {
        const result = await generateStory({ prompt });
        setStory(result.story);
      } catch (error) {
        console.error("Failed to generate story", error);
        toast({
          title: "Generation failed",
          description: "Please try again in a moment.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>Bring your creative ideas to life.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-4">
        <Textarea
          placeholder="A lone astronaut on a forgotten planet finds a mysterious artifact..."
          className="min-h-[80px] resize-none"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          disabled={isPending}
        />
        <Button
          onClick={handleGenerateStory}
          disabled={isPending || !prompt.trim()}
          className="flex-shrink-0"
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Write Story
        </Button>
        {story ? (
          <div className="flex min-h-0 flex-1 flex-col space-y-3">
            <Separator />
            <ScrollArea className="flex-1 p-1">
              <div className="rounded-lg bg-secondary/50 p-3 whitespace-pre-wrap">
                <h3 className="mb-2 font-semibold">Generated Story</h3>
                <p className="text-sm">{story}</p>
              </div>
            </ScrollArea>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
