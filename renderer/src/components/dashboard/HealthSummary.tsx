import { useRef, useState, useTransition } from "react";

import { generateHealthSummary } from "@/lib/ai/flows/GenerateHealthSummary";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Loader2, Stethoscope, Upload } from "lucide-react";

type HealthSummaryProps = {
  name?: string;
};

export default function HealthSummary({ name = "Health Summary" }: HealthSummaryProps) {
  const [summary, setSummary] = useState("");
  const [fileName, setFileName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setFileName(file.name);
    setSummary("");
    setErrorMessage("");

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUri = typeof reader.result === "string" ? reader.result : "";
      if (!dataUri) {
        setErrorMessage("Unable to read the selected file.");
        return;
      }

      startTransition(async () => {
        try {
          const result = await generateHealthSummary({ documentDataUri: dataUri });
          setSummary(result.comprehensiveSummary);
        } catch (error) {
          console.error("Failed to generate health summary", error);
          setErrorMessage("We couldn't analyze that document. Please try another file.");
        }
      });
    };

    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="flex h-full flex-col border-0 bg-transparent shadow-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Stethoscope className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>{name}</CardTitle>
              <CardDescription>Upload a document to generate an H&amp;P.</CardDescription>
            </div>
          </div>
          <div>
            <Input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,application/pdf"
            />
            <Button onClick={handleUploadClick} disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Upload Document
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="min-h-0 flex-1">
        <ScrollArea className="h-full rounded-md border bg-background/50 p-4">
          <h3 className="mb-2 font-semibold">Comprehensive Summary</h3>
          {fileName ? (
            <p className="mb-2 text-xs text-muted-foreground">Source: {fileName}</p>
          ) : null}

          {isPending ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 pt-12 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>Analyzing document and generating summary...</p>
            </div>
          ) : summary ? (
            <div className="prose prose-sm whitespace-pre-wrap dark:prose-invert">{summary}</div>
          ) : errorMessage ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 pt-12 text-center text-muted-foreground">
              <FileText className="mx-auto h-12 w-12" />
              <p>{errorMessage}</p>
              <p className="text-xs">Please try uploading a different document.</p>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 pt-12 text-center text-muted-foreground">
              <FileText className="mx-auto h-12 w-12" />
              <p>The generated H&amp;P report will appear here.</p>
              <p className="text-xs">Upload a medical document to begin.</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
