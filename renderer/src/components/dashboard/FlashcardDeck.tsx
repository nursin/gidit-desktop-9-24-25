import type { ChangeEvent } from "react";
import { useRef, useState, useTransition } from "react";

import { generateFlashcards } from "@/lib/ai/flows/GenerateFlashcards";
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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Layers,
  Loader2,
  RotateCw,
  Sparkles,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";

type CardType = "basic" | "cloze";

type Flashcard = {
  id: string;
  front: string;
  back: string;
  image?: string;
  type: CardType;
};

const initialCards: Flashcard[] = [
  {
    id: uuidv4(),
    front: "What is the powerhouse of the cell?",
    back: "Mitochondria",
    type: "basic",
  },
  {
    id: uuidv4(),
    front: "The capital of France is ...",
    back: "Paris",
    type: "cloze",
  },
  {
    id: uuidv4(),
    front: "What does 'HTTP' stand for?",
    back: "HyperText Transfer Protocol",
    type: "basic",
  },
];

type FlashcardDisplayProps = {
  card: Flashcard;
  isFlipped: boolean;
  onFlip: () => void;
};

function FlashcardDisplay({ card, isFlipped, onFlip }: FlashcardDisplayProps) {
  const frontText = card.type === "cloze" ? card.front.replace("...", "______") : card.front;
  const backText = card.type === "cloze" ? card.front.replace("...", card.back) : card.back;

  return (
    <div
      className="h-48 w-full"
      style={{ perspective: "1000px" }}
      onClick={onFlip}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onFlip();
        }
      }}
    >
      <div
        className="relative flex h-full w-full items-center justify-center"
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 0.5s",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        <div
          className="absolute flex h-full w-full items-center justify-center rounded-lg bg-secondary p-4 text-center"
          style={{ backfaceVisibility: "hidden" }}
        >
          <p className="text-lg font-semibold">{frontText}</p>
        </div>
        <div
          className="absolute flex h-full w-full items-center justify-center rounded-lg bg-primary/20 p-4 text-center"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <p className="text-lg font-semibold">{backText}</p>
        </div>
      </div>
    </div>
  );
}

type FlashcardDeckProps = {
  name?: string;
};

export default function FlashcardDeck({ name = "Flashcard Deck" }: FlashcardDeckProps) {
  const [cards, setCards] = useState<Flashcard[]>(initialCards);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | "none">("none");
  const [topic, setTopic] = useState("");
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

  const currentCard = cards[currentCardIndex];
  const progress = cards.length > 0 ? ((currentCardIndex + 1) / cards.length) * 100 : 0;

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
    setFeedback("none");
  };

  const handleNext = () => {
    if (cards.length === 0) {
      return;
    }
    setIsFlipped(false);
    setUserAnswer("");
    setFeedback("none");
    setCurrentCardIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    if (cards.length === 0) {
      return;
    }
    setIsFlipped(false);
    setUserAnswer("");
    setFeedback("none");
    setCurrentCardIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const checkAnswer = () => {
    if (!currentCard) {
      return;
    }
    const correctAnswer = currentCard.back;
    if (userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()) {
      setFeedback("correct");
      toast({ title: "Correct!", description: "Great job!" });
    } else {
      setFeedback("incorrect");
      toast({
        title: "Not quite",
        description: `The correct answer is: ${correctAnswer}`,
        variant: "destructive",
      });
    }
    setIsFlipped(true);
  };

  const handleGenerate = (subject: string) => {
    const trimmed = subject.trim();
    if (!trimmed) {
      return;
    }

    startTransition(async () => {
      try {
        const result = await generateFlashcards({ topic: trimmed, count: 10 });
        const newCards: Flashcard[] = result.cards.map((card) => ({
          id: uuidv4(),
          front: card.front,
          back: card.back,
          type: card.front.includes("...") ? "cloze" : "basic",
        }));

        if (newCards.length === 0) {
          throw new Error("No cards generated.");
        }

        setCards(newCards);
        setCurrentCardIndex(0);
        setIsFlipped(false);
        setUserAnswer("");
        setFeedback("none");
        toast({
          title: "Deck Generated!",
          description: `Created ${newCards.length} cards about ${trimmed}.`,
        });
      } catch (error) {
        console.error(error);
        toast({
          title: "Generation Failed",
          description: "Could not generate flashcards. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const text = loadEvent.target?.result as string | undefined;
      if (!text) {
        toast({
          title: "Import Failed",
          description: "File could not be read.",
          variant: "destructive",
        });
        return;
      }

      try {
        const newCards: Flashcard[] = text
          .split("\n")
          .map((line) => {
            const parts = line.split("|");
            if (parts.length < 2) {
              return null;
            }
            const front = parts[0].trim();
            const back = parts[1].trim();
            if (!front || !back) {
              return null;
            }
            return {
              id: uuidv4(),
              front,
              back,
              type: front.includes("...") ? "cloze" : "basic",
            } satisfies Flashcard;
          })
          .filter((card): card is Flashcard => card !== null);

        if (newCards.length === 0) {
          throw new Error("No valid cards found in file.");
        }

        setCards(newCards);
        setCurrentCardIndex(0);
        setIsFlipped(false);
        setUserAnswer("");
        setFeedback("none");
        toast({
          title: "Deck Imported!",
          description: `Imported ${newCards.length} cards.`,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error.";
        toast({ title: "Import Failed", description: message, variant: "destructive" });
      }
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Layers className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>Review, create, and master your subjects.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-grow flex-col">
        <Tabs defaultValue="study" className="flex flex-1 flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="study">
              <BookOpen className="mr-2 h-4 w-4" />
              Study
            </TabsTrigger>
            <TabsTrigger value="create">Create Deck</TabsTrigger>
          </TabsList>

          <TabsContent
            value="study"
            className="flex flex-1 flex-col justify-between gap-4"
          >
            {cards.length > 0 && currentCard ? (
              <>
                <div className="flex flex-grow flex-col items-center justify-center gap-4">
                  <FlashcardDisplay
                    card={currentCard}
                    isFlipped={isFlipped}
                    onFlip={handleFlip}
                  />
                  <div className="flex w-full max-w-sm items-center space-x-2">
                    <Input
                      placeholder="Type your answer..."
                      value={userAnswer}
                      onChange={(event) => setUserAnswer(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          checkAnswer();
                        }
                      }}
                      className={cn(
                        feedback === "correct" &&
                          "border-green-500 focus-visible:ring-green-500",
                        feedback === "incorrect" &&
                          "border-red-500 focus-visible:ring-red-500",
                      )}
                    />
                    <Button onClick={checkAnswer}>Check</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      Card {currentCardIndex + 1} of {cards.length}
                    </span>
                  </div>
                  <Progress value={progress} />
                  <div className="flex items-center justify-between">
                    <Button variant="outline" size="icon" onClick={handlePrev}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={handleFlip}>
                      <RotateCw className="mr-2 h-4 w-4" /> Flip
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleNext}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="pt-12 text-center text-muted-foreground">
                <p>No cards in this deck.</p>
                <p className="text-xs">Go to the 'Create Deck' tab to get started.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="create" className="flex flex-1 flex-col gap-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Generate with AI</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="topic"
                  placeholder="e.g., 'React Hooks'"
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                />
                <Button
                  onClick={() => handleGenerate(topic)}
                  disabled={isPending || topic.trim().length === 0}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="file-upload">Upload a .txt file</Label>
              <Input
                id="file-upload"
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".txt"
              />
              <p className="text-xs text-muted-foreground">
                Format: question|answer per line.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
