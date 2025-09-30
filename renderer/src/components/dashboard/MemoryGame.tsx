import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Brain, RotateCw, Star, Heart, Sun, Moon, Cloud, Anchor } from "lucide-react";

type MemoryGameProps = {
  name?: string;
};

type IconId = "star" | "heart" | "sun" | "moon" | "cloud" | "anchor";

type MemoryCard = {
  id: number;
  pairId: IconId;
  icon: JSX.Element;
  isFlipped: boolean;
  isMatched: boolean;
};

const ICON_MAP: Record<IconId, JSX.Element> = {
  star: <Star className="h-6 w-6" />, 
  heart: <Heart className="h-6 w-6" />, 
  sun: <Sun className="h-6 w-6" />, 
  moon: <Moon className="h-6 w-6" />, 
  cloud: <Cloud className="h-6 w-6" />, 
  anchor: <Anchor className="h-6 w-6" />,
};

function createShuffledDeck(): MemoryCard[] {
  const basePairs: IconId[] = ["star", "heart", "sun", "moon", "cloud", "anchor"];
  const cards: MemoryCard[] = basePairs
    .flatMap((pair) => [
      {
        id: Math.random(),
        pairId: pair,
        icon: ICON_MAP[pair],
        isFlipped: false,
        isMatched: false,
      },
      {
        id: Math.random(),
        pairId: pair,
        icon: ICON_MAP[pair],
        isFlipped: false,
        isMatched: false,
      },
    ])
    .map((card, index) => ({ ...card, id: index }));

  return cards.sort(() => Math.random() - 0.5);
}

export default function MemoryGame({ name = "Memory Game" }: MemoryGameProps) {
  const [deck, setDeck] = useState<MemoryCard[]>(() => createShuffledDeck());
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    if (flippedIndices.length !== 2) {
      return;
    }

    const [firstIndex, secondIndex] = flippedIndices;
    const firstCard = deck[firstIndex];
    const secondCard = deck[secondIndex];

    if (!firstCard || !secondCard) {
      setFlippedIndices([]);
      return;
    }

    if (firstCard.pairId === secondCard.pairId) {
      setDeck((prevDeck) =>
        prevDeck.map((card, index) =>
          index === firstIndex || index === secondIndex
            ? { ...card, isMatched: true }
            : card,
        ),
      );
      setFlippedIndices([]);
      return;
    }

    const timeout = window.setTimeout(() => {
      setDeck((prevDeck) =>
        prevDeck.map((card, index) =>
          index === firstIndex || index === secondIndex ? { ...card, isFlipped: false } : card,
        ),
      );
      setFlippedIndices([]);
    }, 1000);

    return () => window.clearTimeout(timeout);
  }, [deck, flippedIndices]);

  const handleCardClick = (index: number) => {
    setDeck((prevDeck) => {
      const card = prevDeck[index];
      if (!card || card.isFlipped || card.isMatched || flippedIndices.length === 2) {
        return prevDeck;
      }

      const updatedDeck = prevDeck.map((item, itemIndex) =>
        itemIndex === index ? { ...item, isFlipped: true } : item,
      );

      setFlippedIndices((prev) => [...prev, index]);
      if (flippedIndices.length === 0) {
        setMoves((prevMoves) => prevMoves + 1);
      }

      return updatedDeck;
    });
  };

  const resetGame = () => {
    setDeck(createShuffledDeck());
    setFlippedIndices([]);
    setMoves(0);
  };

  const isGameWon = useMemo(() => deck.every((card) => card.isMatched), [deck]);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>{name}</CardTitle>
              <CardDescription>Test your concentration.</CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={resetGame} aria-label="Reset game">
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-grow flex-col items-center justify-center gap-4">
        <div className="grid grid-cols-4 gap-2">
          {deck.map((card, index) => {
            const isFlipped = card.isFlipped || card.isMatched;
            return (
              <button
                key={card.id}
                type="button"
                className="h-16 w-12"
                style={{ perspective: "1000px" }}
                onClick={() => handleCardClick(index)}
                disabled={isFlipped || flippedIndices.length === 2}
              >
                <div
                  className="relative h-full w-full rounded-md bg-secondary transition-transform duration-500"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                >
                  <div
                    className="absolute inset-0 flex items-center justify-center rounded-md bg-secondary"
                    style={{ backfaceVisibility: "hidden" }}
                  />
                  <div
                    className="absolute inset-0 flex items-center justify-center rounded-md bg-primary/20 text-primary"
                    style={{
                      transform: "rotateY(180deg)",
                      backfaceVisibility: "hidden",
                    }}
                  >
                    {card.icon}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        {isGameWon ? (
          <p className="font-semibold text-green-500">You won in {moves} moves!</p>
        ) : (
          <p className="text-sm">Moves: {moves}</p>
        )}
      </CardContent>
    </Card>
  );
}
