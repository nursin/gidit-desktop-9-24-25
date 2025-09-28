import { useEffect, useMemo, useState } from 'react'
import { Play, RotateCw, Sparkles, Timer, Trophy } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'

const CHALLENGE_DURATION_SECONDS = 25 * 60

const createInitialTasks = () => [
  { id: 1, text: '', completed: false },
  { id: 2, text: '', completed: false },
  { id: 3, text: '', completed: false },
]

type ChallengeStatus = 'setup' | 'active' | 'completed' | 'failed'

type ChallengeTimerProps = {
  name?: string
}

export default function ChallengeTimer({ name = 'Flash Round Challenge' }: ChallengeTimerProps) {
  const [tasks, setTasks] = useState(createInitialTasks())
  const [timeLeft, setTimeLeft] = useState(CHALLENGE_DURATION_SECONDS)
  const [status, setStatus] = useState<ChallengeStatus>('setup')

  const isActive = status === 'active'
  const allTasksCompleted = useMemo(() => tasks.every((task) => task.completed), [tasks])
  const isSetupValid = useMemo(() => tasks.every((task) => task.text.trim() !== ''), [tasks])

  useEffect(() => {
    if (allTasksCompleted && isActive) {
      setStatus('completed')
    }
  }, [allTasksCompleted, isActive])

  useEffect(() => {
    if (!isActive) return
    if (timeLeft <= 0) {
      setStatus(allTasksCompleted ? 'completed' : 'failed')
      return
    }
    const timer = window.setInterval(() => {
      setTimeLeft((previous) => previous - 1)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [isActive, timeLeft, allTasksCompleted])

  const handleTaskTextChange = (id: number, text: string) => {
    setTasks((previous) => previous.map((task) => (task.id === id ? { ...task, text } : task)))
  }

  const handleTaskCompletionChange = (id: number, completed: boolean) => {
    setTasks((previous) => previous.map((task) => (task.id === id ? { ...task, completed } : task)))
  }

  const startChallenge = () => {
    if (isSetupValid) {
      setStatus('active')
    }
  }

  const resetChallenge = () => {
    setTasks(createInitialTasks())
    setTimeLeft(CHALLENGE_DURATION_SECONDS)
    setStatus('setup')
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`
  }

  const renderStatusScreen = () => {
    if (status === 'completed') {
      return (
        <div className="space-y-2 text-center">
          <Sparkles className="mx-auto h-12 w-12 text-yellow-400" />
          <p className="text-lg font-bold">Challenge Complete!</p>
          <p className="text-sm text-muted-foreground">
            You finished with {formatTime(timeLeft)} remaining.
          </p>
          <Button onClick={resetChallenge} size="sm" className="mt-2">
            <RotateCw className="mr-2 h-4 w-4" />
            New Challenge
          </Button>
        </div>
      )
    }

    if (status === 'failed') {
      return (
        <div className="space-y-2 text-center">
          <Trophy className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-bold text-destructive">Time's Up!</p>
          <p className="text-sm text-muted-foreground">Better luck next time. You got this!</p>
          <Button onClick={resetChallenge} size="sm" className="mt-2">
            <RotateCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      )
    }

    return null
  }

  return (
    <Card className="flex h-full flex-col border-0 bg-transparent shadow-none rounded-none">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Trophy className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>Complete 3 tasks in 25 minutes.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col items-center justify-center gap-4">
        {status === 'setup' || status === 'active' ? (
          <>
            <div className="w-full space-y-2">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={task.completed}
                    onCheckedChange={(checked) =>
                      handleTaskCompletionChange(task.id, Boolean(checked))
                    }
                    disabled={!isActive}
                  />
                  <Input
                    placeholder={`Task #${task.id}...`}
                    value={task.text}
                    onChange={(event) => handleTaskTextChange(task.id, event.target.value)}
                    disabled={isActive}
                    className="h-8"
                  />
                </div>
              ))}
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Time Remaining</p>
              <p className="font-mono text-4xl font-bold text-primary">{formatTime(timeLeft)}</p>
            </div>
            {status === 'setup' && (
              <Button onClick={startChallenge} disabled={!isSetupValid}>
                <Play className="mr-2 h-4 w-4" />
                Start Challenge
              </Button>
            )}
          </>
        ) : (
          renderStatusScreen()
        )}
      </CardContent>
    </Card>
  )
}
