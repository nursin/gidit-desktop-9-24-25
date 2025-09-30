import { useEffect, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/useToast";
import { generateSessionRecap } from "@/lib/ai/flows/GenerateSessionRecap";
import { Loader2, Sparkles, Zap } from "lucide-react";

const recentTasksExample =
  "Finished Q3 report draft, Called plumber about kitchen sink, Sketched out new feature design for 'Project Phoenix'";

type SessionRecapProps = {
  name?: string;
};

export default function SessionRecap({ name = "Quick Recap" }: SessionRecapProps) {
  const [recap, setRecap] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleGenerateRecap = () => {
    startTransition(async () => {
      try {
        const result = await generateSessionRecap({ recentTasks: recentTasksExample });
        setRecap(result.recap);
      } catch (error) {
        console.error("Failed to generate recap", error);
        toast({
          title: "Error Generating Recap",
          description: "Could not fetch your recent activity. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  useEffect(() => {
    handleGenerateRecap();
  }, []);

  return (
    <Card className="flex h-full flex-col border-0 bg-transparent shadow-none">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Zap className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>Get back on track, fast.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-grow flex-col items-center justify-center gap-4 text-center">
        {isPending && !recap ? (
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        ) : recap ? (
          <div className="rounded-lg bg-secondary p-4">
            <p className="whitespace-pre-wrap font-medium">{recap}</p>
          </div>
        ) : (
          <p className="text-muted-foreground">
            Click the button for a summary of your last session.
          </p>
        )}
        <Button onClick={handleGenerateRecap} disabled={isPending}>
          {isPending ? (
            "Remembering..."
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" /> Refresh Recap
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
