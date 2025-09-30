import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Eye,
  EyeOff,
  HelpCircle,
  KeyRound,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

type VerificationStatus = "idle" | "success" | "fail";

type SecurityQuestion = {
  question: string;
  answer: string;
};

const securityQuestions: SecurityQuestion[] = [
  { question: "What was the name of your first pet?", answer: "Buddy" },
  { question: "In what city did your parents meet?", answer: "San Diego" },
  { question: "What is your mother's maiden name?", answer: "Smith" },
  { question: "What was the model of your first car?", answer: "Honda Civic" },
  { question: "What is your favorite childhood book?", answer: "The Giving Tree" },
];

type FamilyAuthenticatorProps = {
  name?: string;
};

export default function FamilyAuthenticator({
  name = "Family Authenticator",
}: FamilyAuthenticatorProps) {
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [verificationInput, setVerificationInput] = useState<string>("");
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("idle");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isAnswerVisible, setIsAnswerVisible] = useState(false);

  const generateNewCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
  };

  useEffect(() => {
    generateNewCode();
    setCurrentQuestionIndex(Math.floor(Math.random() * securityQuestions.length));
  }, []);

  const handleVerifyCode = () => {
    if (verificationInput === generatedCode && generatedCode !== "") {
      setVerificationStatus("success");
    } else {
      setVerificationStatus("fail");
    }
  };

  const getNextQuestion = () => {
    setIsAnswerVisible(false);
    setCurrentQuestionIndex((prev) => (prev + 1) % securityQuestions.length);
  };

  const statusIcons = useMemo(
    () => ({
      idle: <KeyRound className="h-12 w-12 text-muted-foreground" />,
      success: <ShieldCheck className="h-12 w-12 text-green-500" />,
      fail: <ShieldAlert className="h-12 w-12 text-destructive" />,
    }),
    [],
  );

  const statusMessages: Record<VerificationStatus, { text: string; className: string }> = {
    idle: {
      text: "Enter the 6-digit code to verify.",
      className: "text-muted-foreground",
    },
    success: {
      text: "Verification Successful! Identity confirmed.",
      className: "font-semibold text-green-500",
    },
    fail: {
      text: "Verification Failed. Code is incorrect.",
      className: "font-semibold text-destructive",
    },
  };

  const currentQuestion = securityQuestions[currentQuestionIndex];

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>Verify the identity of a family member.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-grow flex-col">
        <Tabs defaultValue="verify" className="flex flex-1 flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="verify">Verify Code</TabsTrigger>
            <TabsTrigger value="get">Get Code</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
          </TabsList>

          <TabsContent
            value="verify"
            className="flex flex-1 flex-col items-center justify-center gap-4 text-center"
          >
            {statusIcons[verificationStatus]}
            <p className={cn("h-10 text-sm", statusMessages[verificationStatus].className)}>
              {statusMessages[verificationStatus].text}
            </p>
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input
                type="text"
                placeholder="_ _ _ _ _ _"
                maxLength={6}
                value={verificationInput}
                onChange={(event) => {
                  setVerificationInput(event.target.value);
                  setVerificationStatus("idle");
                }}
                className="h-14 text-center text-2xl font-mono tracking-widest"
              />
              <Button onClick={handleVerifyCode}>Verify</Button>
            </div>
          </TabsContent>

          <TabsContent
            value="get"
            className="flex flex-1 flex-col items-center justify-center gap-4 text-center"
          >
            <KeyRound className="h-12 w-12 text-primary" />
            <p className="text-muted-foreground">Share this code with your family member.</p>
            <div className="rounded-lg bg-secondary p-4">
              <p className="text-5xl font-mono tracking-widest text-primary">{generatedCode}</p>
            </div>
            <Button onClick={generateNewCode} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Generate New Code
            </Button>
          </TabsContent>

          <TabsContent
            value="questions"
            className="flex flex-1 flex-col items-center justify-center gap-4 text-center"
          >
            <HelpCircle className="h-12 w-12 text-primary" />
            <p className="text-muted-foreground">
              Ask the person this question to verify them.
            </p>
            <Card className="w-full max-w-sm p-4">
              <p className="font-semibold">{currentQuestion.question}</p>
              {isAnswerVisible && (
                <p className="mt-2 animate-in fade-in text-lg font-bold text-primary">
                  {currentQuestion.answer}
                </p>
              )}
            </Card>
            <div className="flex gap-2">
              <Button onClick={() => setIsAnswerVisible((prev) => !prev)} variant="secondary">
                {isAnswerVisible ? (
                  <EyeOff className="mr-2 h-4 w-4" />
                ) : (
                  <Eye className="mr-2 h-4 w-4" />
                )}
                {isAnswerVisible ? "Hide Answer" : "Show Answer"}
              </Button>
              <Button onClick={getNextQuestion} variant="outline">
                Next Question
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
