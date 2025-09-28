import { useEffect, useMemo, useState } from 'react'
import { Coffee, Footprints, Wind } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const meditationIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-primary"
  >
    <path d="M12 2a10 10 0 1 0 10 10c0-2.3-1.3-4-3-5" />
    <path d="M9 13.5c0 .8.5 1.5 1.2 1.5s1.2-.8 1.2-1.5c0-.8-.5-1.5-1.2-1.5s-1.2.7-1.2 1.5Z" />
    <path d="M15.5 11c.8 0 1.5.5 1.5 1.2s-.7 1.2-1.5 1.2c-.8 0-1.5-.5-1.5-1.2s.7-1.2 1.5-1.2Z" />
    <path d="M18 10c.8 0 1.5.5 1.5 1.2s-.7 1.2-1.5 1.2c-.8 0-1.5-.5-1.5-1.2s.7-1.2 1.5-1.2Z" />
    <path d="M6 10c.8 0 1.5.5 1.5 1.2S6.8 12.4 6 12.4c-.8 0-1.5-.5-1.5-1.2S5.2 10 6 10Z" />
  </svg>
)

const suggestions = [
  { text: 'Stretch for 5 minutes.', icon: <Footprints className="h-8 w-8 text-primary" /> },
  { text: 'Get some fresh air.', icon: <Wind className="h-8 w-8 text-primary" /> },
  { text: 'Grab a cup of coffee or tea.', icon: <Coffee className="h-8 w-8 text-primary" /> },
  { text: 'Do a quick meditation.', icon: meditationIcon },
]

type BreakPromptTileProps = {
  name?: string
}

export default function BreakPromptTile({ name = 'Time for a Break?' }: BreakPromptTileProps) {
  const [currentSuggestion, setCurrentSuggestion] = useState(suggestions[0])

  const picker = useMemo(() => suggestions, [])

  const getNewSuggestion = () => {
    setCurrentSuggestion((previous) => {
      let next = previous
      while (next === previous) {
        next = picker[Math.floor(Math.random() * picker.length)]
      }
      return next
    })
  }

  useEffect(() => {
    getNewSuggestion()
  }, [])

  return (
    <Card className="flex h-full flex-col border-0 bg-transparent shadow-none rounded-none">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Coffee className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>Rest is productive too.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        {currentSuggestion.icon}
        <p className="text-lg font-medium">{currentSuggestion.text}</p>
        <Button onClick={getNewSuggestion} variant="outline">
          New Suggestion
        </Button>
      </CardContent>
    </Card>
  )
}
