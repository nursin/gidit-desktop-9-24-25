import type { ChangeEvent } from "react";
import { useMemo, useRef, useState, useTransition } from "react";

import { analyzeImageForGallery, type ImageAnalysis } from "@/lib/ai/flows/AnalyzeImageForGallery";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/useToast";
import {
  Image as ImageIcon,
  Loader2,
  Search,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";

type GalleryProps = {
  name?: string;
};

type ImageRecord = ImageAnalysis & {
  id: string;
  dataUri: string;
  uploadedAt: Date;
  status: "processing" | "complete" | "error";
};

export default function Gallery({ name = "Gallery" }: GalleryProps) {
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        return;
      }

      const reader = new FileReader();
      const recordId = uuidv4();

      reader.onloadend = () => {
        const dataUri = String(reader.result ?? "");
        if (!dataUri) {
          return;
        }

        const pendingRecord: ImageRecord = {
          id: recordId,
          dataUri,
          uploadedAt: new Date(),
          status: "processing",
          title: file.name,
          description: "Analyzing image...",
          categories: [],
          extractedText: "",
        };

        setImages((prev) => [pendingRecord, ...prev]);

        startTransition(async () => {
          try {
            const analysis = await analyzeImageForGallery({ imageDataUri: dataUri });
            setImages((prev) =>
              prev.map((image) =>
                image.id === recordId
                  ? {
                      ...image,
                      ...analysis,
                      status: "complete",
                    }
                  : image,
              ),
            );
          } catch (error) {
            console.error("Image analysis failed", error);
            setImages((prev) =>
              prev.map((image) =>
                image.id === recordId
                  ? {
                      ...image,
                      status: "error",
                      description: "Analysis failed.",
                    }
                  : image,
              ),
            );
            toast({
              title: "Analysis failed",
              description: `Could not analyze ${file.name}.`,
              variant: "destructive",
            });
          }
        });
      };

      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const deleteImage = (id: string) => {
    setImages((prev) => prev.filter((image) => image.id !== id));
    toast({ title: "Image deleted." });
  };

  const categories = useMemo(() => {
    const set = new Set<string>();
    images.forEach((image) => image.categories.forEach((cat) => set.add(cat)));
    return ["all", ...Array.from(set)];
  }, [images]);

  const filteredImages = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return images.filter((image) => {
      const matchesCategory =
        selectedCategory === "all" || image.categories.includes(selectedCategory);
      if (!matchesCategory) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [image.title, image.description, image.extractedText]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query));
    });
  }, [images, searchTerm, selectedCategory]);

  return (
    <Card className="flex h-full flex-col border-0 bg-transparent shadow-none">
      <CardHeader>
        <div className="flex items-center gap-3">
          <ImageIcon className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>Your smart, searchable photo library.</CardDescription>
          </div>
        </div>
        <div className="flex flex-col gap-2 pt-2 sm:flex-row">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, content, or text in image..."
              className="w-full pl-8"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category} className="capitalize">
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
            multiple
          />
          <Button onClick={() => fileInputRef.current?.click()} className="w-full sm:w-auto">
            <Upload className="mr-2 h-4 w-4" />
            {isPending ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="min-h-0 flex-1">
        <ScrollArea className="-mx-6 h-full">
          {filteredImages.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 px-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filteredImages.map((image) => (
                <Dialog key={image.id}>
                  <DialogTrigger asChild>
                    <div className="group relative aspect-square cursor-pointer">
                      <img
                        src={image.dataUri}
                        alt={image.title}
                        className="h-full w-full rounded-lg object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 flex flex-col justify-end rounded-lg bg-black/50 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100">
                        <h3 className="truncate text-sm font-semibold">{image.title}</h3>
                      </div>
                      {image.status === "processing" && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/70">
                          <Loader2 className="h-8 w-8 animate-spin text-white" />
                        </div>
                      )}
                      {image.status === "error" && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-red-900/70">
                          <XCircle className="h-8 w-8 text-white" />
                        </div>
                      )}
                    </div>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>{image.title}</DialogTitle>
                      <DialogDescription>
                        {format(image.uploadedAt, "MMMM d, yyyy")}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid max-h-[80vh] grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="relative">
                        <div className="aspect-square overflow-hidden rounded-md bg-muted">
                          <img
                            src={image.dataUri}
                            alt={image.title}
                            className="h-full w-full object-contain"
                          />
                        </div>
                      </div>
                      <ScrollArea className="pr-4">
                        <div className="space-y-4">
                          <div>
                            <h4 className="mb-1 font-semibold">Description</h4>
                            <p className="text-sm text-muted-foreground">{image.description}</p>
                          </div>
                          <div>
                            <h4 className="mb-2 font-semibold">Categories</h4>
                            <div className="flex flex-wrap gap-2">
                              {image.categories.map((category) => (
                                <Badge key={category} variant="secondary">
                                  {category}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          {image.extractedText && (
                            <div>
                              <h4 className="mb-1 font-semibold">Extracted Text</h4>
                              <p className="whitespace-pre-wrap rounded-md bg-secondary p-2 text-sm text-muted-foreground">
                                {image.extractedText}
                              </p>
                            </div>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" className="mt-4">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Image
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the image. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteImage(image.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </ScrollArea>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          ) : (
            <div className="pt-12 text-center text-muted-foreground">
              <ImageIcon className="mx-auto mb-2 h-12 w-12" />
              <p>No images found.</p>
              <p className="text-xs">
                Upload an image to get started or adjust your search filters.
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
