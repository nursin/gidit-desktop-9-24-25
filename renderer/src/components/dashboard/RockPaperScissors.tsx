import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Bot, Hand, Scissors } from "lucide-react";

type Choice = "rock" | "paper" | "scissors";

type RockPaperScissorsProps = {
  name?: string;
};

const choices: Choice[] = ["rock", "paper", "scissors"];

const CHOICE_ICONS: Record<Choice, JSX.Element> = {
  rock: <Hand className="h-8 w-8 rotate-90" />,
  paper: <Hand className="h-8 w-8" />,
  scissors: <Scissors className="h-8 w-8" />,
};

export default function RockPaperScissors({ name = "Rock Paper Scissors" }: RockPaperScissorsProps) {
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [computerChoice, setComputerChoice] = useState<Choice | null>(null);
  const [result, setResult] = useState<"win" | "lose" | "draw" | null>(null);

  const handlePlay = (choice: Choice) => {
    const randomChoice = choices[Math.floor(Math.random() * choices.length)];
    setPlayerChoice(choice);
    setComputerChoice(randomChoice);

    if (choice === randomChoice) {
      setResult("draw");
      return;
    }

    const wins =
      (choice === "rock" && randomChoice === "scissors") ||
      (choice === "scissors" && randomChoice === "paper") ||
      (choice === "paper" && randomChoice === "rock");

    setResult(wins ? "win" : "lose");
  };

  const resultText = useMemo(() => {
    if (!result) {
      return "Choose your weapon!";
    }
    if (result === "win") {
      return "You Win!";
    }
    if (result === "lose") {
      return "You Lose!";
    }
    return "It's a Draw!";
  }, [result]);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Hand className="h-6 w-6 rotate-90 text-primary" />
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>A quick game of chance.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-grow flex-col items-center justify-center gap-4">
        <div className="flex w-full items-center justify-around">
          <ChoiceDisplay label="You" icon={playerChoice ? CHOICE_ICONS[playerChoice] : "?"} variant="player" />
          <span className="text-lg font-bold">vs</span>
          <ChoiceDisplay
            label="Bot"
            icon={computerChoice ? CHOICE_ICONS[computerChoice] : <Bot className="h-8 w-8" />}
            variant="bot"
          />
        </div>
        <p className="h-6 text-xl font-bold">{resultText}</p>
        <div className="flex gap-2">
          {choices.map((choice) => (
            <Button
              key={choice}
              variant="outline"
              size="icon"
              className="h-12 w-12"
              onClick={() => handlePlay(choice)}
            >
              {CHOICE_ICONS[choice]}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

type ChoiceDisplayProps = {
  label: string;
  icon: React.ReactNode;
  variant: "player" | "bot";
};

function ChoiceDisplay({ label, icon, variant }: ChoiceDisplayProps) {
  const color = variant === "player" ? "text-primary" : "text-destructive";

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="font-semibold">{label}</span>
      <div
        className={cn(
          "flex h-20 w-20 items-center justify-center rounded-lg bg-secondary",
          color,
        )}
      >
        {icon}
      </div>
    </div>
  );
}
