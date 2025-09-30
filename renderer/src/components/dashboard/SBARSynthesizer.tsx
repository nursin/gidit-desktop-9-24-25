import { useRef, useState, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/useToast";
import {
  synthesizeSbarReport,
} from "@/lib/ai/flows/SBARSynthesizer";
import {
  type SbarSynthesizerInput,
  type SbarSynthesizerOutput,
} from "@/lib/ai/schemas/SBARSynthesizerSchemas";
import {
  FileDown,
  FileText,
  Loader2,
  Presentation,
  Upload,
  XCircle,
} from "lucide-react";

const MINIMUM_NOTE_LENGTH = 20;

type DocumentFile = {
  fileName: string;
  dataUri: string;
};

type SbarSynthesizerProps = {
  name?: string;
};

export default function SBARSynthesizer({
  name = "SBAR Synthesizer",
}: SbarSynthesizerProps) {
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<DocumentFile[]>([]);
  const [result, setResult] = useState<SbarSynthesizerOutput | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) {
      return;
    }

    Array.from(selectedFiles).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = typeof reader.result === "string" ? reader.result : "";
        if (!dataUri) {
          return;
        }
        setFiles((previous) => [...previous, { fileName: file.name, dataUri }]);
      };
      reader.readAsDataURL(file);
    });

    if (event.target) {
      event.target.value = "";
    }
  };

  const removeFile = (fileName: string) => {
    setFiles((previous) => previous.filter((file) => file.fileName !== fileName));
  };

  const handleSynthesize = () => {
    if (notes.trim().length < MINIMUM_NOTE_LENGTH) {
      toast({
        title: "Notes are too short",
        description: "Please provide more detail in your notes.",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      setResult(null);
      try {
        const input: SbarSynthesizerInput = { notes, documents: files };
        const report = await synthesizeSbarReport(input);
        setResult(report);
      } catch (error) {
        console.error("Failed to synthesize SBAR", error);
        toast({
          title: "An error occurred",
          description: "Could not synthesize the SBAR report. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  const handleDownload = (content: string, fileName: string, mimeType: string) => {
    const encoded = window.btoa(content);
    const link = document.createElement("a");
    link.href = `data:${mimeType};base64,${encoded}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: `${fileName} download started.` });
  };

  const generatePresentationText = (slides: SbarSynthesizerOutput["presentationSlides"]) =>
    slides
      .map((slide) => {
        const bulletList = slide.content.map((point) => `- ${point}`).join("\n");
        return `Slide: ${slide.title}\n${bulletList}`;
      })
      .join("\n\n");

  return (
    <Card className="flex h-full flex-col border-0 bg-transparent shadow-none">
      <CardHeader>
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>
              Generate evidence-based SBAR reports from notes and documents.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid min-h-0 flex-1 grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <Textarea
            placeholder="Paste your raw notes, clinical observations, and project ideas here..."
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="min-h-[150px] flex-grow resize-none"
            disabled={isPending}
          />
          <div className="space-y-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              multiple
              accept="image/*,application/pdf"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full"
              disabled={isPending}
            >
              <Upload className="mr-2 h-4 w-4" /> Upload Documents
            </Button>
            <div className="space-y-1">
              {files.map((file) => (
                <div
                  key={file.fileName}
                  className="flex items-center justify-between rounded bg-secondary p-1 text-xs"
                >
                  <span className="truncate">{file.fileName}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => removeFile(file.fileName)}
                  >
                    <XCircle className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <Button onClick={handleSynthesize} disabled={isPending || !notes.trim()}>
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Presentation className="mr-2 h-4 w-4" />
            )}
            Synthesize SBAR
          </Button>
        </div>

        <ScrollArea className="-mr-4 h-full pr-4">
          <div className="flex flex-col gap-4">
            {isPending && (
              <div className="flex h-32 items-center justify-center text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}

            {result ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>SBAR Report</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-muted-foreground">
                    <section>
                      <h4 className="font-semibold text-foreground">Situation</h4>
                      <p>{result.situation}</p>
                    </section>
                    <Separator />
                    <section>
                      <h4 className="font-semibold text-foreground">Background</h4>
                      <p>{result.background}</p>
                    </section>
                    <Separator />
                    <section>
                      <h4 className="font-semibold text-foreground">Assessment</h4>
                      <p>{result.assessment}</p>
                    </section>
                    <Separator />
                    <section className="space-y-1">
                      <h4 className="font-semibold text-foreground">Recommendation</h4>
                      <p>{result.recommendation.text}</p>
                      <p>
                        <strong>Success Metrics:</strong> {result.recommendation.successMetrics}
                      </p>
                    </section>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Generated Assets</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(result.pdfContent, "sbar_report.txt", "text/plain")}
                    >
                      <FileDown className="mr-2 h-4 w-4" /> SBAR Report
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleDownload(
                          generatePresentationText(result.presentationSlides),
                          "sbar_presentation.txt",
                          "text/plain",
                        )
                      }
                    >
                      <Presentation className="mr-2 h-4 w-4" /> Presentation
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Literature Review</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {result.literature.map((item) => (
                      <div key={item.title} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={item.status === "supporting" ? "default" : "destructive"}>
                            {item.status === "supporting" ? "Supporting" : "Contradicting"}
                          </Badge>
                          <span className="font-semibold text-sm">{item.title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{item.summary}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </>
            ) : null}

            {!result && !isPending ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                Your generated report will appear here.
              </div>
            ) : null}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
