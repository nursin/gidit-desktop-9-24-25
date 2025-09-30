'use client';

import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";
import { AlertTriangle, Copy, Mic, MicOff } from "lucide-react";

type VoiceCaptureProps = {
  name?: string;
};

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

export default function VoiceCapture({ name = "Voice Capture" }: VoiceCaptureProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const RecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!RecognitionConstructor) {
      setSupported(false);
      return;
    }

    const recognition = new RecognitionConstructor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }
      setTranscript((prev) => `${prev}${finalTranscript}${interimTranscript}`);
    };

    recognition.onerror = (event) => {
      toast({
        title: "Voice recognition error",
        description: String(event.error ?? "Unknown error"),
        variant: "destructive",
      });
      setIsRecording(false);
    };

    recognition.onend = () => {
      if (isRecording) {
        recognition.start();
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [isRecording, toast]);

  const toggleRecording = useCallback(() => {
    if (!recognitionRef.current) {
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setTranscript("");
      recognitionRef.current.start();
      setIsRecording(true);
    }
  }, [isRecording]);

  const handleCopy = useCallback(() => {
    if (!transcript.trim()) {
      return;
    }
    void navigator.clipboard.writeText(transcript);
    toast({ title: "Copied to clipboard" });
  }, [toast, transcript]);

  return (
    <Card className="flex h-full flex-col border-0 bg-transparent shadow-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mic className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>{name}</CardTitle>
              <CardDescription>Use your voice to capture notes.</CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleCopy} disabled={!transcript}>
            <Copy className="mr-2 h-4 w-4" /> Copy
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col items-center justify-center gap-4">
        {!supported ? (
          <div className="flex flex-col items-center gap-2 text-center text-destructive">
            <AlertTriangle className="h-8 w-8" />
            <p className="font-semibold">Voice recognition not supported.</p>
            <p className="text-xs">Try a different browser such as Chrome or Safari.</p>
          </div>
        ) : (
          <>
            <Button
              size="lg"
              onClick={toggleRecording}
              className={cn(
                "h-24 w-24 rounded-full transition-all duration-300",
                isRecording && "animate-pulse bg-destructive hover:bg-destructive/90",
              )}
            >
              {isRecording ? <MicOff className="h-10 w-10" /> : <Mic className="h-10 w-10" />}
            </Button>
            <p className="text-sm text-muted-foreground">
              {isRecording ? "Recording… click to stop" : "Click to start recording."}
            </p>
            <Textarea
              placeholder="Your transcribed text will appear here…"
              className="w-full flex-1 resize-none bg-background/50 text-sm"
              value={transcript}
              readOnly
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
