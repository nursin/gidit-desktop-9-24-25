'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Clock, Flag, Target } from 'lucide-react'

const goals = {
  longTerm: [
    {
      id: 'ltg1',
      title: "Launch Side Project 'Gidit'",
      timeEstimate: '6 Months',
      progress: 15,
      milestones: [
        'Develop core feature set',
        'Design and implement UI/UX',
        'Set up deployment pipeline',
        'Run beta testing phase',
      ],
    },
    {
      id: 'ltg2',
      title: 'Learn conversational Spanish',
      timeEstimate: '1 Year',
      progress: 5,
      milestones: [
        'Complete beginner Duolingo course',
        'Practice with a language partner weekly',
        'Watch 10 hours of Spanish-language TV',
      ],
    },
  ],
  shortTerm: [
    {
      id: 'stg1',
      title: 'Finish Q3 Report',
      timeEstimate: '2 Weeks',
      progress: 80,
      milestones: ['Compile analytics data', 'Draft executive summary', 'Final review with manager'],
    },
    {
      id: 'stg2',
      title: 'Plan and book fall vacation',
      timeEstimate: '1 Week',
      progress: 40,
      milestones: ['Decide on destination', 'Book flights', 'Book accommodations'],
    },
  ],
}

export default function GoalPlanner() {
  return (
    <Card className="h-full flex flex-col bg-transparent border-0 shadow-none rounded-none">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Target className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>Goal Planner</CardTitle>
            <CardDescription>Define and track your objectives.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="min-h-0 flex-1">
        <ScrollArea className="h-full pr-4">
          <Accordion type="multiple" defaultValue={['long-term', 'short-term']} className="w-full">
            <AccordionItem value="long-term">
              <AccordionTrigger className="text-lg font-semibold">Long-Term Goals</AccordionTrigger>
              <AccordionContent className="space-y-4">
                {goals.longTerm.map((goal) => (
                  <div key={goal.id} className="rounded-lg bg-background/30 p-3">
                    <div className="mb-2 flex items-start justify-between">
                      <h4 className="font-semibold">{goal.title}</h4>
                      <Badge variant="outline" className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        {goal.timeEstimate}
                      </Badge>
                    </div>
                    <Progress value={goal.progress} className="mb-3 h-2" />
                    <ul className="space-y-1.5 text-sm">
                      {goal.milestones.map((milestone, index) => (
                        <li key={index} className="flex items-center gap-2 text-muted-foreground">
                          <Flag className="h-4 w-4 text-primary/70" />
                          <span>{milestone}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="short-term">
              <AccordionTrigger className="text-lg font-semibold">Short-Term Goals</AccordionTrigger>
              <AccordionContent className="space-y-4">
                {goals.shortTerm.map((goal) => (
                  <div key={goal.id} className="rounded-lg bg-background/30 p-3">
                    <div className="mb-2 flex items-start justify-between">
                      <h4 className="font-semibold">{goal.title}</h4>
                      <Badge variant="outline" className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        {goal.timeEstimate}
                      </Badge>
                    </div>
                    <Progress value={goal.progress} className="mb-3 h-2" />
                    <ul className="space-y-1.5 text-sm">
                      {goal.milestones.map((milestone, index) => (
                        <li key={index} className="flex items-center gap-2 text-muted-foreground">
                          <Flag className="h-4 w-4 text-primary/70" />
                          <span>{milestone}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
