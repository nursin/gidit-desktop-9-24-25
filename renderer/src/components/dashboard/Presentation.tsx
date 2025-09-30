import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Plus,
  Presentation as PresentationIcon,
  Trash2,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";

type Slide = {
  id: string;
  title: string;
  content: string;
};

type PresentationProps = {
  name?: string;
};

const initialSlides: Slide[] = [
  {
    id: uuidv4(),
    title: "Welcome to Presentations",
    content: "This is your first slide. Edit it or add new ones!",
  },
];

export default function Presentation({ name = "Presentation" }: PresentationProps) {
  const [slides, setSlides] = useState<Slide[]>(initialSlides);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fullscreenRef = useRef<HTMLDivElement | null>(null);

  const currentSlide = useMemo(() => slides[currentSlideIndex], [slides, currentSlideIndex]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const addSlide = () => {
    const newSlide: Slide = {
      id: uuidv4(),
      title: "New Slide",
      content: "Add your content here.",
    };
    const insertionIndex = currentSlideIndex + 1;
    const nextSlides = [
      ...slides.slice(0, insertionIndex),
      newSlide,
      ...slides.slice(insertionIndex),
    ];
    setSlides(nextSlides);
    setCurrentSlideIndex(insertionIndex);
  };

  const deleteSlide = () => {
    if (slides.length <= 1) {
      return;
    }
    const updated = slides.filter((_, index) => index !== currentSlideIndex);
    setSlides(updated);
    setCurrentSlideIndex((prev) => Math.max(0, prev - 1));
  };

  const updateSlide = (field: keyof Omit<Slide, "id">, value: string) => {
    setSlides((prev) =>
      prev.map((slide, index) =>
        index === currentSlideIndex ? { ...slide, [field]: value } : slide,
      ),
    );
  };

  const goToPrev = () => {
    setCurrentSlideIndex((prev) => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setCurrentSlideIndex((prev) => Math.min(slides.length - 1, prev + 1));
  };

  const toggleFullscreen = () => {
    const element = fullscreenRef.current;
    if (!element) {
      return;
    }

    if (!document.fullscreenElement) {
      element
        .requestFullscreen()
        .catch((error) => {
          window.alert(`Error attempting to enable full-screen mode: ${error.message} (${error.name})`);
        });
    } else {
      void document.exitFullscreen();
    }
  };

  return (
    <Card className="flex h-full flex-col border-0 bg-transparent shadow-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PresentationIcon className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>{name}</CardTitle>
              <CardDescription>Create and view simple slides.</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={addSlide}>
              <Plus className="mr-2 h-4 w-4" /> Slide
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={deleteSlide}
              disabled={slides.length <= 1}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-4">
        <div className="flex flex-1 flex-col gap-2 rounded-lg border bg-background/50 p-4">
          <Input
            placeholder="Slide Title"
            value={currentSlide.title}
            onChange={(event) => updateSlide("title", event.target.value)}
            className="h-auto border-none p-1 text-lg font-bold shadow-none focus-visible:ring-0"
          />
          <Textarea
            placeholder="Slide content..."
            value={currentSlide.content}
            onChange={(event) => updateSlide("content", event.target.value)}
            className="flex-1 resize-none border-none p-1 shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goToPrev} disabled={currentSlideIndex === 0}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Slide {currentSlideIndex + 1} of {slides.length}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNext}
              disabled={currentSlideIndex === slides.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={toggleFullscreen}>
            <Play className="mr-2 h-4 w-4" /> Present
          </Button>
        </div>
        <div ref={fullscreenRef} className="hidden">
          {isFullscreen && (
            <div className="flex h-screen w-screen flex-col items-center justify-center gap-8 bg-background p-16 text-center">
              <h1 className="text-6xl font-bold">{currentSlide.title}</h1>
              <p className="whitespace-pre-wrap text-3xl">{currentSlide.content}</p>
              <div className="absolute bottom-8 flex gap-4">
                <Button variant="outline" size="lg" onClick={goToPrev} disabled={currentSlideIndex === 0}>
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={goToNext}
                  disabled={currentSlideIndex === slides.length - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
