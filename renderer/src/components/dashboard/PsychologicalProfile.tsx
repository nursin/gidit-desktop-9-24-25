import { useState, useTransition } from "react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/useToast";
import { generatePsychologicalProfile, type PsychologicalProfile } from "@/lib/ai/flows/GeneratePsychologicalProfile";
import {
  AlertTriangle,
  Briefcase,
  CheckCircle,
  Loader2,
  Sparkles,
  Target,
  UserCheck,
} from "lucide-react";

type PsychologicalProfileProps = {
  name?: string;
};

const mockActivitySummary = `
- Tasks Completed (last 30 days): 45 total. 60% 'Work', 30% 'Personal', 10% 'Home'. High completion rate on 'Urgent & Important' tasks.
- Mood Entries: Predominantly 'Good' (4) and 'Great' (5) on weekdays. 'Okay' (3) on weekends.
- Focus Sessions: Averages 3 sessions of 25 minutes per day. Most frequent in the morning (9am-11am).
- Widgets Used: Frequently uses 'Tasks Quadrant', 'ToDoList', and 'NoteDisplay'. Rarely uses 'Goal Planner'.
- Notes Content: Often includes creative ideas, project plans, and technical notes.
`;

type ProfileSection = PsychologicalProfile["strengths"];

const renderProfileSection = (section: ProfileSection, icon: React.ReactNode) => (
  <AccordionItem value={section.title} key={section.title}>
    <AccordionTrigger>
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-semibold">{section.title}</span>
      </div>
    </AccordionTrigger>
    <AccordionContent>
      <div className="space-y-3 pl-8">
        <p className="text-sm italic text-muted-foreground">{section.summary}</p>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {section.bulletPoints.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </div>
    </AccordionContent>
  </AccordionItem>
);

export default function PsychologicalProfile({ name = "Psychological Profile" }: PsychologicalProfileProps) {
  const [profile, setProfile] = useState<PsychologicalProfile | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleGenerateProfile = () => {
    startTransition(async () => {
      setProfile(null);
      try {
        const result = await generatePsychologicalProfile({ activitySummary: mockActivitySummary });
        setProfile(result);
      } catch (error) {
        console.error("Error generating profile", error);
        toast({
          title: "Analysis Failed",
          description: "Could not generate your profile. Please try again later.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Card className="flex h-full flex-col border-0 bg-transparent shadow-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserCheck className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>{name}</CardTitle>
              <CardDescription>AI-powered insights into your habits and potential.</CardDescription>
            </div>
          </div>
          <Button onClick={handleGenerateProfile} disabled={isPending}>
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Generate Report
          </Button>
        </div>
      </CardHeader>
      <CardContent className="min-h-0 flex-1">
        <ScrollArea className="-mr-4 h-full pr-4">
          {isPending ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : profile ? (
            <div className="space-y-4">
              <div className="rounded-lg border bg-background/50 p-4">
                <h3 className="mb-2 font-semibold">Overall Summary</h3>
                <p className="text-sm text-muted-foreground">{profile.overallSummary}</p>
              </div>
              <Accordion
                type="multiple"
                defaultValue={[
                  profile.strengths.title,
                  profile.areasForImprovement.title,
                  profile.professionalDevelopment.title,
                ]}
                className="w-full"
              >
                {renderProfileSection(
                  profile.strengths,
                  <CheckCircle className="h-5 w-5 text-green-500" />,
                )}
                {renderProfileSection(
                  profile.areasForImprovement,
                  <Target className="h-5 w-5 text-yellow-500" />,
                )}
                {renderProfileSection(
                  profile.professionalDevelopment,
                  <Briefcase className="h-5 w-5 text-blue-500" />,
                )}
              </Accordion>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
              <AlertTriangle className="mb-4 h-12 w-12" />
              <p className="font-semibold">No profile generated yet.</p>
              <p className="text-sm">Click "Generate Report" to get your personalized insights.</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
