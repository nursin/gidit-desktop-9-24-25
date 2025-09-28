import { useEffect, useState, useTransition } from 'react'
import { Lightbulb, Loader2, Wand2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

const examplePastTasks =
  "Finished Q3 report, Planned next week's meals, Responded to non-critical emails, Organized desktop files"

const mockGenerate = async () => {
  await new Promise((resolve) => setTimeout(resolve, 600))
  return {
    suggestedTasks: [
      'Review project backlog and prioritize top three items',
      'Draft follow-up emails for pending requests',
      'Organize meeting notes into shared space',
      'Schedule 30-minute focus block for deep work',
    ],
  }
}

type DailyTaskSuggestionsProps = {
  name?: string
}

export default function DailyTaskSuggestions({ name = 'Daily Suggestions' }: DailyTaskSuggestionsProps) {
  const [suggestedTasks, setSuggestedTasks] = useState<string[]>([])
  const [isPending, startTransition] = useTransition()

  const handleGenerateSuggestions = () => {
    startTransition(async () => {
      const result = await mockGenerate()
      setSuggestedTasks(result.suggestedTasks)
    })
  }

  useEffect(() => {
    handleGenerateSuggestions()
  }, [])

  return (
    <Card className="flex h-full flex-col border-0 bg-transparent shadow-none rounded-none">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Lightbulb className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>Smart ideas for what to do next.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        {isPending && suggestedTasks.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ScrollArea className="flex-1">
            <ul className="list-disc space-y-2 pr-4 text-sm">
              {suggestedTasks.map((task, index) => (
                <li key={`${task}-${index}`}>{task}</li>
              ))}
            </ul>
          </ScrollArea>
        )}
        <Button onClick={handleGenerateSuggestions} disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
          Refresh Suggestions
        </Button>
      </CardContent>
    </Card>
  )
}
