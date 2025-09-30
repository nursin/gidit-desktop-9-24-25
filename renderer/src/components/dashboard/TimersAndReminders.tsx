'use client';

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/useToast";
import { format, formatDistanceToNow, addDays, addWeeks } from "date-fns";
import {
  Bell,
  Pause,
  Play,
  Plus,
  Repeat,
  RotateCw,
  Timer as TimerIcon,
  Trash2,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";

export type RepeatOption = "none" | "daily" | "weekly";

export type Reminder = {
  id: string;
  name: string;
  dueDateTime: Date;
  repeat: RepeatOption;
};

export type TimerInstance = {
  id: string;
  name: string;
  initialDuration: number;
  timeLeft: number;
  isRunning: boolean;
};

type TimeRemainingProps = {
  dueDate: Date;
};

type ReminderItemProps = {
  reminder: Reminder;
  onRemove: (id: string) => void;
};

type TimerItemProps = {
  timer: TimerInstance;
  onToggle: (id: string) => void;
  onReset: (id: string) => void;
  onRemove: (id: string) => void;
};

type TimersAndRemindersProps = {
  name?: string;
};

function formatTime(seconds: number) {
  return new Date(seconds * 1000).toISOString().slice(14, 19);
}

function TimeRemaining({ dueDate }: TimeRemainingProps) {
  const [timeString, setTimeString] = useState<string>("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      if (dueDate < now) {
        setTimeString("Overdue");
      } else {
        setTimeString(formatDistanceToNow(dueDate, { addSuffix: true }));
      }
    };

    update();
    const interval = setInterval(update, 30_000);
    return () => clearInterval(interval);
  }, [dueDate]);

  return <span className="text-xs text-muted-foreground">{timeString}</span>;
}

function ReminderItem({ reminder, onRemove }: ReminderItemProps) {
  return (
    <div className="relative flex items-center gap-3 rounded-lg border bg-secondary/50 p-3">
      <Bell className="h-5 w-5 flex-shrink-0 text-primary" />
      <div className="flex-grow">
        <h4 className="truncate text-sm font-semibold">{reminder.name}</h4>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{format(reminder.dueDateTime, "MMM d, yyyy @ h:mm a")}</span>
          <span>&bull;</span>
          <TimeRemaining dueDate={reminder.dueDateTime} />
        </div>
      </div>
      {reminder.repeat !== "none" ? <Repeat className="h-3 w-3 text-muted-foreground" /> : null}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 flex-shrink-0"
        onClick={() => onRemove(reminder.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

function TimerItem({ timer, onToggle, onReset, onRemove }: TimerItemProps) {
  const progress = timer.initialDuration
    ? ((timer.initialDuration - timer.timeLeft) / timer.initialDuration) * 100
    : 0;

  return (
    <div className="rounded-lg border bg-secondary/50 p-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">{timer.name}</h4>
        <p className="font-mono text-lg">{formatTime(timer.timeLeft)}</p>
      </div>
      <Progress value={progress} className="my-2" />
      <div className="flex items-center gap-2">
        <Button size="sm" className="w-20" onClick={() => onToggle(timer.id)}>
          {timer.isRunning ? (
            <>
              <Pause className="mr-2 h-4 w-4" /> Pause
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" /> Start
            </>
          )}
        </Button>
        <Button size="sm" variant="outline" onClick={() => onReset(timer.id)}>
          <RotateCw className="mr-2 h-4 w-4" /> Reset
        </Button>
        <Button size="icon" variant="ghost" className="ml-auto" onClick={() => onRemove(timer.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function TimersAndReminders({ name = "Timers & Reminders" }: TimersAndRemindersProps) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [timers, setTimers] = useState<TimerInstance[]>([]);

  const [newName, setNewName] = useState("");
  const [newDate, setNewDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [newTime, setNewTime] = useState(() => format(new Date(), "HH:mm"));
  const [newRepeat, setNewRepeat] = useState<RepeatOption>("none");

  const { toast } = useToast();
  const timersIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const remindersIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timersIntervalRef.current = setInterval(() => {
      setTimers((prev) =>
        prev.map((timer) => {
          if (!timer.isRunning) {
            return timer;
          }
          if (timer.timeLeft <= 1) {
            toast({
              title: "Timer finished!",
              description: `Your timer "${timer.name}" is done.`,
            });
            return { ...timer, timeLeft: 0, isRunning: false };
          }
          return { ...timer, timeLeft: timer.timeLeft - 1 };
        }),
      );
    }, 1_000);

    return () => {
      if (timersIntervalRef.current) {
        clearInterval(timersIntervalRef.current);
      }
    };
  }, [toast]);

  useEffect(() => {
    remindersIntervalRef.current = setInterval(() => {
      const now = new Date();
      setReminders((prev) =>
        prev
          .map((reminder) => {
            if (reminder.repeat === "none" || reminder.dueDateTime >= now) {
              return reminder;
            }
            let nextDue = reminder.dueDateTime;
            while (nextDue < now) {
              nextDue = reminder.repeat === "daily" ? addDays(nextDue, 1) : addWeeks(nextDue, 1);
            }
            return { ...reminder, dueDateTime: nextDue };
          })
          .sort((a, b) => a.dueDateTime.getTime() - b.dueDateTime.getTime()),
      );
    }, 60_000);

    return () => {
      if (remindersIntervalRef.current) {
        clearInterval(remindersIntervalRef.current);
      }
    };
  }, []);

  const handleAddTimer = (seconds: number, label: string) => {
    const timer: TimerInstance = {
      id: uuidv4(),
      name: label,
      initialDuration: seconds,
      timeLeft: seconds,
      isRunning: false,
    };
    setTimers((prev) => [...prev, timer]);
  };

  const handleToggleTimer = (id: string) => {
    setTimers((prev) =>
      prev.map((timer) =>
        timer.id === id ? { ...timer, isRunning: !timer.isRunning } : timer,
      ),
    );
  };

  const handleResetTimer = (id: string) => {
    setTimers((prev) =>
      prev.map((timer) =>
        timer.id === id
          ? { ...timer, timeLeft: timer.initialDuration, isRunning: false }
          : timer,
      ),
    );
  };

  const handleRemoveTimer = (id: string) => {
    setTimers((prev) => prev.filter((timer) => timer.id !== id));
  };

  const handleAddReminder = () => {
    if (!newName.trim() || !newDate || !newTime) {
      toast({
        title: "Missing information",
        description: "Please provide a name, date, and time.",
        variant: "destructive",
      });
      return;
    }

    const dueDateTime = new Date(`${newDate}T${newTime}`);
    if (Number.isNaN(dueDateTime.getTime())) {
      toast({ title: "Invalid date/time", variant: "destructive" });
      return;
    }

    const reminder: Reminder = {
      id: uuidv4(),
      name: newName.trim(),
      dueDateTime,
      repeat: newRepeat,
    };

    setReminders((prev) =>
      [...prev, reminder].sort((a, b) => a.dueDateTime.getTime() - b.dueDateTime.getTime()),
    );
    setNewName("");
    toast({ title: "Reminder set!", description: `"${reminder.name}" scheduled.` });
  };

  const handleRemoveReminder = (id: string) => {
    setReminders((prev) => prev.filter((reminder) => reminder.id !== id));
  };

  return (
    <Card className="flex h-full flex-col border-0 bg-transparent shadow-none">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <TimerIcon className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>Set countdowns and scheduled reminders.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-4">
        <Tabs defaultValue="timers" className="flex min-h-0 flex-1 flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="timers">Timers</TabsTrigger>
            <TabsTrigger value="reminders">Reminders</TabsTrigger>
          </TabsList>

          <TabsContent value="timers" className="flex flex-1 flex-col gap-4 pt-4">
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              <Button variant="outline" onClick={() => handleAddTimer(5 * 60, "5 Min Timer")}>
                5 min
              </Button>
              <Button variant="outline" onClick={() => handleAddTimer(15 * 60, "15 Min Timer")}>
                15 min
              </Button>
              <Button variant="outline" onClick={() => handleAddTimer(25 * 60, "25 Min Timer")}>
                25 min
              </Button>
              <Button variant="outline" onClick={() => handleAddTimer(60 * 60, "1 Hour Timer")}>
                60 min
              </Button>
            </div>
            <ScrollArea className="-mr-4 flex-1 pr-4">
              <div className="space-y-3">
                {timers.length ? (
                  timers.map((timer) => (
                    <TimerItem
                      key={timer.id}
                      timer={timer}
                      onToggle={handleToggleTimer}
                      onReset={handleResetTimer}
                      onRemove={handleRemoveTimer}
                    />
                  ))
                ) : (
                  <div className="pt-12 text-center text-muted-foreground">
                    <p>No active timers.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="reminders" className="flex flex-1 flex-col gap-4 pt-4">
            <div className="space-y-3 rounded-lg border bg-background/50 p-4">
              <Input
                placeholder="Reminder name..."
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="date"
                  value={newDate}
                  onChange={(event) => setNewDate(event.target.value)}
                />
                <Input
                  type="time"
                  value={newTime}
                  onChange={(event) => setNewTime(event.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 items-center gap-3">
                <Select value={newRepeat} onValueChange={(value: RepeatOption) => setNewRepeat(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Repeat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Does not repeat</SelectItem>
                    <SelectItem value="daily">Repeats Daily</SelectItem>
                    <SelectItem value="weekly">Repeats Weekly</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleAddReminder}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Reminder
                </Button>
              </div>
            </div>
            <ScrollArea className="-mr-4 flex-1 pr-4">
              <div className="space-y-3">
                {reminders.length ? (
                  reminders.map((reminder) => (
                    <ReminderItem key={reminder.id} reminder={reminder} onRemove={handleRemoveReminder} />
                  ))
                ) : (
                  <div className="pt-12 text-center text-muted-foreground">
                    <p>No reminders set.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default TimersAndReminders;
