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
import { Gamepad2, RotateCw } from "lucide-react";

export type Player = "X" | "O" | null;

type TicTacToeProps = {
  name?: string;
  initialPlayer?: Player;
};

const LINES: [number, number, number][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function calculateWinner(board: Player[]): Player {
  for (const [a, b, c] of LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

export default function TicTacToe({ name = "Tic-Tac-Toe", initialPlayer = "X" }: TicTacToeProps) {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>(initialPlayer);

  const winner = useMemo(() => calculateWinner(board), [board]);
  const isDraw = useMemo(() => !winner && board.every(Boolean), [board, winner]);

  const handleClick = (index: number) => {
    if (winner || board[index]) {
      return;
    }
    const nextBoard = board.slice();
    nextBoard[index] = currentPlayer;
    setBoard(nextBoard);
    setCurrentPlayer((prev) => (prev === "X" ? "O" : "X"));
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer(initialPlayer);
  };

  const status = () => {
    if (winner) {
      return `Winner: ${winner}!`;
    }
    if (isDraw) {
      return "It's a draw!";
    }
    return `Next player: ${currentPlayer}`;
  };

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Gamepad2 className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>{name}</CardTitle>
              <CardDescription>A classic game of strategy.</CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={resetGame}>
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col items-center justify-center gap-4">
        <p className="font-semibold">{status()}</p>
        <div className="grid grid-cols-3 gap-2">
          {board.map((value, index) => (
            <button
              key={index}
              type="button"
              className={cn(
                "flex h-16 w-16 items-center justify-center rounded-md bg-secondary text-3xl font-bold",
                value === "X" ? "text-primary" : value === "O" ? "text-destructive" : "",
              )}
              onClick={() => handleClick(index)}
              disabled={Boolean(value) || Boolean(winner)}
            >
              {value}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
