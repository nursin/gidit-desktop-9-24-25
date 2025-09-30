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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { format } from "date-fns";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { v4 as uuidv4 } from "uuid";

import { Check, Dumbbell, History, Plus, Trash2 } from "lucide-react";

type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
};

type Workout = {
  id: string;
  date: Date;
  name: string;
  exercises: Exercise[];
};

const initialWorkouts: Workout[] = [
  {
    id: uuidv4(),
    date: new Date(Date.now() - 86400000 * 2),
    name: "Push Day",
    exercises: [
      { id: uuidv4(), name: "Bench Press", sets: 3, reps: 8, weight: 135 },
      { id: uuidv4(), name: "Overhead Press", sets: 3, reps: 10, weight: 75 },
    ],
  },
  {
    id: uuidv4(),
    date: new Date(Date.now() - 86400000 * 4),
    name: "Pull Day",
    exercises: [
      { id: uuidv4(), name: "Deadlift", sets: 1, reps: 5, weight: 225 },
      { id: uuidv4(), name: "Pull Ups", sets: 3, reps: 8, weight: 0 },
    ],
  },
];

type FitnessTrackerProps = {
  name?: string;
};

export default function FitnessTracker({ name = "Fitness Tracker" }: FitnessTrackerProps) {
  const [workouts, setWorkouts] = useState<Workout[]>(initialWorkouts);
  const [currentWorkout, setCurrentWorkout] = useState<Exercise[]>([]);
  const [workoutName, setWorkoutName] = useState("Today's Workout");

  const addExercise = () => {
    const newExercise: Exercise = {
      id: uuidv4(),
      name: "New Exercise",
      sets: 3,
      reps: 10,
      weight: 0,
    };
    setCurrentWorkout((prev) => [...prev, newExercise]);
  };

  const updateExercise = (id: string, field: keyof Exercise, value: string | number) => {
    setCurrentWorkout((prev) =>
      prev.map((exercise) => (exercise.id === id ? { ...exercise, [field]: value } : exercise)),
    );
  };

  const removeExercise = (id: string) => {
    setCurrentWorkout((prev) => prev.filter((exercise) => exercise.id !== id));
  };

  const finishWorkout = () => {
    if (currentWorkout.length === 0) {
      return;
    }

    const newWorkout: Workout = {
      id: uuidv4(),
      date: new Date(),
      name: workoutName,
      exercises: currentWorkout,
    };

    setWorkouts((prev) => [newWorkout, ...prev]);
    setCurrentWorkout([]);
    setWorkoutName("Today's Workout");
  };

  const totalVolumeData = useMemo(
    () =>
      workouts
        .map((workout) => ({
          date: format(workout.date, "MMM d"),
          volume: workout.exercises.reduce(
            (acc, exercise) => acc + exercise.sets * exercise.reps * exercise.weight,
            0,
          ),
        }))
        .reverse(),
    [workouts],
  );

  return (
    <Card className="flex h-full flex-col border-0 bg-transparent shadow-none">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Dumbbell className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>Log workouts and track your progress.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col min-h-0">
        <Tabs defaultValue="log" className="flex flex-1 flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="log">Log Workout</TabsTrigger>
            <TabsTrigger value="history">
              <History className="mr-2 h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="stats">
              <BarChart className="mr-2 h-4 w-4" />
              Stats
            </TabsTrigger>
          </TabsList>

          <TabsContent value="log" className="flex flex-1 flex-col gap-4 pt-4">
            <div className="flex items-center gap-4">
              <Input
                value={workoutName}
                onChange={(event) => setWorkoutName(event.target.value)}
                placeholder="Workout Name (e.g., Push Day)"
              />
              <Button onClick={addExercise}>
                <Plus className="mr-2 h-4 w-4" />
                Exercise
              </Button>
            </div>
            <ScrollArea className="-mr-4 flex-1 pr-4">
              <div className="space-y-4">
                {currentWorkout.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="grid grid-cols-12 items-center gap-2 rounded-lg bg-background/50 p-3"
                  >
                    <Input
                      value={exercise.name}
                      onChange={(event) => updateExercise(exercise.id, "name", event.target.value)}
                      className="col-span-4 h-8"
                    />
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs text-muted-foreground">Sets</Label>
                      <Input
                        type="number"
                        value={exercise.sets}
                        onChange={(event) =>
                          updateExercise(exercise.id, "sets", Number(event.target.value))
                        }
                        className="h-8"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs text-muted-foreground">Reps</Label>
                      <Input
                        type="number"
                        value={exercise.reps}
                        onChange={(event) =>
                          updateExercise(exercise.id, "reps", Number(event.target.value))
                        }
                        className="h-8"
                      />
                    </div>
                    <div className="col-span-3 space-y-1">
                      <Label className="text-xs text-muted-foreground">Weight (lbs)</Label>
                      <Input
                        type="number"
                        value={exercise.weight}
                        onChange={(event) =>
                          updateExercise(exercise.id, "weight", Number(event.target.value))
                        }
                        className="h-8"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="col-span-1 h-8 w-8"
                      onClick={() => removeExercise(exercise.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Button onClick={finishWorkout} disabled={currentWorkout.length === 0}>
              <Check className="mr-2 h-4 w-4" />
              Finish Workout
            </Button>
          </TabsContent>

          <TabsContent value="history" className="flex-1 pt-4">
            <ScrollArea className="-mr-4 h-full pr-4">
              <div className="space-y-4">
                {workouts.map((workout) => (
                  <div key={workout.id} className="rounded-lg border bg-background/50 p-4">
                    <div className="mb-2 flex items-baseline justify-between">
                      <h4 className="font-semibold">{workout.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {format(workout.date, "EEEE, MMM d")}
                      </p>
                    </div>
                    <ul className="space-y-1 text-sm">
                      {workout.exercises.map((exercise) => (
                        <li key={exercise.id} className="flex justify-between">
                          <span>{exercise.name}</span>
                          <span className="text-muted-foreground">
                            {exercise.sets}x{exercise.reps} @ {exercise.weight} lbs
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="stats" className="flex flex-1 flex-col gap-4 pt-4">
            <h4 className="text-center font-semibold">Total Volume Over Time</h4>
            <div className="h-64 flex-grow">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={totalVolumeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="volume"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
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
