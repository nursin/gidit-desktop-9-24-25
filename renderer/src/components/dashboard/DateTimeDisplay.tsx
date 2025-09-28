"use client"

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'

type DateTimeDisplayProps = {
  name?: string
}

const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}

const TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
}

export default function DateTimeDisplay({ name = 'Date & Time' }: DateTimeDisplayProps) {
  const [currentDateTime, setCurrentDateTime] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentDateTime(new Date())
    }, 1_000)

    return () => window.clearInterval(timer)
  }, [])

  const formattedDate = useMemo(
    () => new Intl.DateTimeFormat('en-US', DATE_OPTIONS).format(currentDateTime),
    [currentDateTime]
  )

  const formattedTime = useMemo(
    () => new Intl.DateTimeFormat('en-US', TIME_OPTIONS).format(currentDateTime),
    [currentDateTime]
  )

  return (
    <Card className="flex h-full flex-col border-0 bg-transparent shadow-none rounded-none">
      <CardContent className="flex flex-1 flex-col items-center justify-center gap-2 p-4 text-center">
        <div className="text-xs uppercase tracking-[0.4em] text-slate-500 dark:text-slate-300">
          {name}
        </div>
        <div className="font-mono text-4xl font-bold text-primary">
          {formattedTime}
        </div>
        <div className="text-sm text-muted-foreground">{formattedDate}</div>
      </CardContent>
    </Card>
  )
}
