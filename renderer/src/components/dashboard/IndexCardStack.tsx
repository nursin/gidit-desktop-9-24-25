import { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Layers } from "lucide-react";

type IndexCardStackProps = {
  name?: string;
};

type CardEntry = {
  title: string;
  answer: string;
};

const cardContent: CardEntry[] = [
  {
    title: "What is the primary goal of the Eisenhower Matrix?",
    answer: "To prioritize tasks by urgency and importance.",
  },
  {
    title: "What does the 'Pomodoro Technique' involve?",
    answer: "Working in focused 25-minute intervals separated by short breaks.",
  },
  {
    title: "What is 'Time Blocking'?",
    answer: "Scheduling specific blocks of time for individual tasks or activities.",
  },
  {
    title: "What does 'Eat the Frog' mean in productivity?",
    answer: "Tackle your most challenging and important task first thing in the morning.",
  },
  {
    title: "What is the 'Two-Minute Rule'?",
    answer: "If a task takes less than two minutes to complete, do it immediately.",
  },
];

export default function IndexCardStack({ name = "Index Card Stack" }: IndexCardStackProps) {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [current, setCurrent] = useState(1);

  useEffect(() => {
    if (!api) {
      return;
    }

    const updateCurrent = () => {
      setCurrent(api.selectedScrollSnap() + 1);
    };

    updateCurrent();
    api.on("select", updateCurrent);

    return () => {
      api.off("select", updateCurrent);
    };
  }, [api]);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Layers className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>Cycle through your notes or tasks.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-grow flex-col items-center justify-center gap-4">
        <Carousel setApi={setApi} className="w-full max-w-xs">
          <CarouselContent>
            {cardContent.map((item) => (
              <CarouselItem key={item.title}>
                <div className="p-1">
                  <Card className="flex h-[200px] flex-col justify-center">
                    <CardHeader>
                      <CardTitle className="text-center text-lg">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-muted-foreground">{item.answer}</p>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
        <div className="py-2 text-center text-sm text-muted-foreground">
          Card {current} of {cardContent.length}
        </div>
      </CardContent>
    </Card>
  );
}
