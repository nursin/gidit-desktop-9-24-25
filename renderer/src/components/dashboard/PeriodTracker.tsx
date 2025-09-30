import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DayPicker, type Matcher } from "react-day-picker";
import { addDays, differenceInDays, format } from "date-fns";
import { Droplet } from "lucide-react";

type PeriodTrackerProps = {
  name?: string;
};

type CycleData = {
  cycleDay: number;
  nextPeriodStart: Date;
  daysUntilNextPeriod: number;
  modifiers: {
    menstruation: Matcher;
    fertile: Matcher;
    ovulation: Matcher;
  };
  modifiersStyles: Record<string, React.CSSProperties>;
};

const INITIAL_LOG = [new Date()];

export default function PeriodTracker({ name = "Period Tracker" }: PeriodTrackerProps) {
  const [periodLog, setPeriodLog] = useState<Date[]>(INITIAL_LOG);
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const sortedLog = useMemo(
    () => [...periodLog].sort((a, b) => b.getTime() - a.getTime()),
    [periodLog],
  );

  const lastPeriodStart = sortedLog[0] ?? new Date();

  const cycleData = useMemo<CycleData>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const cycleDay = (differenceInDays(today, lastPeriodStart) % cycleLength) + 1;
    const nextPeriodStart = addDays(lastPeriodStart, cycleLength);
    const daysUntilNextPeriod = Math.max(0, differenceInDays(nextPeriodStart, today));

    const menstruationDays: Matcher = (date) =>
      sortedLog.some((start) => {
        const diff = differenceInDays(date, start);
        return diff >= 0 && diff < periodLength;
      });

    const ovulationDay: Matcher = {
      from: addDays(lastPeriodStart, 13),
      to: addDays(lastPeriodStart, 14),
    };

    const fertileWindow: Matcher = {
      from: addDays(lastPeriodStart, 11),
      to: addDays(lastPeriodStart, 15),
    };

    return {
      cycleDay,
      nextPeriodStart,
      daysUntilNextPeriod,
      modifiers: {
        menstruation: menstruationDays,
        fertile: fertileWindow,
        ovulation: ovulationDay,
      },
      modifiersStyles: {
        menstruation: {
          backgroundColor: "hsl(var(--primary) / 0.2)",
          color: "hsl(var(--primary))",
        },
        fertile: {
          backgroundColor: "hsl(var(--accent) / 0.3)",
        },
        ovulation: {
          backgroundColor: "hsl(var(--accent))",
          color: "hsl(var(--accent-foreground))",
        },
      },
    };
  }, [cycleLength, lastPeriodStart, periodLength, sortedLog]);

  const handleLogPeriod = () => {
    setPeriodLog((previous) => [new Date(), ...previous]);
  };

  return (
    <Card className="flex h-full flex-col border-0 bg-transparent shadow-none">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Droplet className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>Track your menstrual cycle and predictions.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DayPicker
            mode="single"
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            modifiers={cycleData.modifiers}
            modifiersStyles={cycleData.modifiersStyles}
            className="w-full"
            classNames={{
              day: "h-9 w-9 rounded-full p-0 font-normal aria-selected:opacity-100",
              day_selected:
                "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
              day_today: "rounded-full bg-accent text-accent-foreground",
            }}
          />
        </div>
        <div className="space-y-4 lg:col-span-1">
          <div className="rounded-lg bg-background/50 p-4 text-center">
            <p className="text-sm text-muted-foreground">Cycle Day</p>
            <p className="text-4xl font-bold">{cycleData.cycleDay}</p>
          </div>
          <div className="rounded-lg bg-background/50 p-4">
            <h4 className="mb-2 text-sm font-semibold">Cycle Insights</h4>
            <ul className="space-y-1 text-xs">
              <li>
                Next period starts in <span className="font-bold">{cycleData.daysUntilNextPeriod}</span>{" "}
                days.
              </li>
              <li>
                Estimated Next Period: {" "}
                <span className="font-bold">{format(cycleData.nextPeriodStart, "MMM d")}</span>
              </li>
            </ul>
          </div>
          <div className="space-y-3 rounded-lg bg-background/50 p-4">
            <h4 className="text-sm font-semibold">Settings</h4>
            <div className="space-y-1">
              <Label htmlFor="cycleLength" className="text-xs">
                Avg. Cycle Length
              </Label>
              <Input
                id="cycleLength"
                type="number"
                value={cycleLength}
                onChange={(event) => setCycleLength(Number(event.target.value) || 0)}
                className="h-8"
                min={10}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="periodLength" className="text-xs">
                Avg. Period Length
              </Label>
              <Input
                id="periodLength"
                type="number"
                value={periodLength}
                onChange={(event) => setPeriodLength(Number(event.target.value) || 0)}
                className="h-8"
                min={1}
              />
            </div>
          </div>
          <Button className="w-full" onClick={handleLogPeriod}>
            Log Today as Period Start
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
