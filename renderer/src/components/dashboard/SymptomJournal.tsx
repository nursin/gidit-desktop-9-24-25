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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/useToast";
import { NotebookText, Plus, Trash2, BarChart } from "lucide-react";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type SymptomEntry = {
  id: string;
  symptom: string;
  severity: number;
  notes: string;
  date: Date;
};

type SymptomJournalProps = {
  name?: string;
};

const initialEntries: SymptomEntry[] = [
  {
    id: uuidv4(),
    symptom: "Headache",
    severity: 7,
    notes: "Felt a sharp pain behind my right eye after screen time.",
    date: new Date(Date.now() - 86400000 * 3),
  },
  {
    id: uuidv4(),
    symptom: "Anxiety",
    severity: 5,
    notes: "Feeling restless and on edge before the meeting.",
    date: new Date(Date.now() - 86400000 * 2),
  },
  {
    id: uuidv4(),
    symptom: "Fatigue",
    severity: 8,
    notes: "Woke up feeling exhausted, couldn't focus.",
    date: new Date(Date.now() - 86400000 * 1),
  },
  {
    id: uuidv4(),
    symptom: "Headache",
    severity: 4,
    notes: "Dull ache, manageable with water.",
    date: new Date(Date.now() - 86400000 * 1),
  },
];

export default function SymptomJournal({ name = "Symptom Journal" }: SymptomJournalProps) {
  const [entries, setEntries] = useState<SymptomEntry[]>(initialEntries);
  const [newSymptom, setNewSymptom] = useState("");
  const [newSeverity, setNewSeverity] = useState(5);
  const [newNotes, setNewNotes] = useState("");
  const [selectedSymptom, setSelectedSymptom] = useState<string | "all">("all");
  const { toast } = useToast();

  const uniqueSymptoms = useMemo(
    () => ["all", ...Array.from(new Set(entries.map((entry) => entry.symptom)))],
    [entries],
  );

  const chartData = useMemo(() => {
    const filtered =
      selectedSymptom === "all"
        ? entries
        : entries.filter((entry) => entry.symptom === selectedSymptom);

    return filtered
      .slice()
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map((entry) => ({
        date: entry.date,
        label: format(entry.date, "MMM d"),
        severity: entry.severity,
        symptom: entry.symptom,
      }));
  }, [entries, selectedSymptom]);

  const handleLogEntry = () => {
    if (!newSymptom.trim()) {
      toast({ title: "Symptom name required", variant: "destructive" });
      return;
    }

    const entry: SymptomEntry = {
      id: uuidv4(),
      symptom: newSymptom.trim(),
      severity: newSeverity,
      notes: newNotes.trim(),
      date: new Date(),
    };

    setEntries((prev) =>
      [entry, ...prev].sort((a, b) => b.date.getTime() - a.date.getTime()),
    );
    setNewSymptom("");
    setNewSeverity(5);
    setNewNotes("");
    toast({ title: "Symptom logged", description: `${entry.symptom} was saved.` });
  };

  const handleDeleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
    toast({ title: "Entry deleted" });
  };

  return (
    <Card className="flex h-full flex-col border-0 bg-transparent shadow-none">
      <CardHeader>
        <div className="flex items-center gap-3">
          <NotebookText className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>Track symptoms to identify patterns.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col">
        <Tabs defaultValue="log" className="flex flex-1 flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="log">Log Entry</TabsTrigger>
            <TabsTrigger value="trends">
              <BarChart className="mr-2 h-4 w-4" />
              Trends
            </TabsTrigger>
          </TabsList>

          <TabsContent value="log" className="flex flex-1 flex-col gap-4 pt-4">
            <div className="space-y-4 rounded-lg border bg-background/50 p-4">
              <div className="space-y-2">
                <Label htmlFor="symptom-name">Symptom</Label>
                <Input
                  id="symptom-name"
                  placeholder="e.g., Headache, Anxiety"
                  value={newSymptom}
                  onChange={(event) => setNewSymptom(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Severity: {newSeverity}/10</Label>
                <Slider
                  value={[newSeverity]}
                  onValueChange={([value]) => setNewSeverity(value)}
                  min={1}
                  max={10}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="symptom-notes">Notes</Label>
                <Textarea
                  id="symptom-notes"
                  placeholder="Any details? Triggers, duration..."
                  value={newNotes}
                  onChange={(event) => setNewNotes(event.target.value)}
                />
              </div>
              <Button className="w-full" onClick={handleLogEntry}>
                <Plus className="mr-2 h-4 w-4" /> Log Symptom
              </Button>
            </div>

            <h4 className="pt-2 text-sm font-semibold">Recent Entries</h4>
            <ScrollArea className="-mr-4 flex-1 pr-4">
              <div className="space-y-3">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="group relative rounded-lg bg-secondary/50 p-3 text-sm"
                  >
                    <div className="flex justify-between font-semibold">
                      <span>{entry.symptom}</span>
                      <span>Severity: {entry.severity}/10</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {format(entry.date, "MMM d, yyyy 'at' h:mm a")}
                    </p>
                    {entry.notes ? (
                      <p className="mt-2 text-xs italic">“{entry.notes}”</p>
                    ) : null}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => handleDeleteEntry(entry.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="trends" className="flex flex-1 flex-col gap-4 pt-4">
            <div className="flex flex-wrap items-center gap-2">
              <Label className="text-sm">Filter by symptom:</Label>
              <div className="flex flex-wrap gap-1">
                {uniqueSymptoms.map((symptom) => (
                  <Button
                    key={symptom}
                    variant={selectedSymptom === symptom ? "secondary" : "ghost"}
                    size="sm"
                    className="capitalize"
                    onClick={() => setSelectedSymptom(symptom)}
                  >
                    {symptom}
                  </Button>
                ))}
              </div>
            </div>
            <div className="h-64 flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                    formatter={(value: number, _name: string, entry) => [
                      `Severity: ${value}/10`,
                      entry.payload.symptom as string,
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="severity"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
