import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Gift, Dices, Zap } from "lucide-react";

type MysteryTaskPickerProps = {
  name?: string;
};

const tasks = [
  "Organize your desktop files",
  "Reply to 3 old emails",
  "Stretch for 5 minutes",
  "Plan your meals for tomorrow",
  "Tidy up your workspace",
  "Read one article related to your field",
  "Do a 10-minute brain dump",
  "Unsubscribe from 5 newsletters",
  "Watch a 15-minute TED talk",
];

export default function MysteryTaskPicker({ name = "Mystery Task Picker" }: MysteryTaskPickerProps) {
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);

  const handleDrawTask = () => {
    setIsRevealing(true);
    setSelectedTask(null);

    window.setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * tasks.length);
      setSelectedTask(tasks[randomIndex]);
      setIsRevealing(false);
    }, 1000);
  };

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Gift className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>Get a random task to tackle now.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-grow flex-col items-center justify-center gap-4 text-center">
        <div className="relative flex h-24 w-40 items-center justify-center">
          {isRevealing ? (
            <Dices className="h-12 w-12 animate-bounce text-primary" />
          ) : selectedTask ? (
            <div className="animate-in fade-in-50 rounded-lg bg-secondary p-4">
              <p className="font-semibold">{selectedTask}</p>
            </div>
          ) : (
            <p className="text-muted-foreground">Click the button to draw a task!</p>
          )}
        </div>
        <Button onClick={handleDrawTask} disabled={isRevealing}>
          {isRevealing ? (
            "Drawing..."
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" /> Draw a Task
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
