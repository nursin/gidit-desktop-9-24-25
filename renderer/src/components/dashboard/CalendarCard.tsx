import { useState } from 'react'
import { addDays, format, isSameDay, startOfDay } from 'date-fns'
import { CalendarDays } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

const today = startOfDay(new Date())
const generateFutureDays = (count: number) => Array.from({ length: count }, (_, index) => addDays(today, index))

const generateInitialEvents = () => [
  {
    id: 'evt-1',
    date: today,
    items: ['Finalize presentation deck', 'Schedule dentist appointment'],
  },
  {
    id: 'evt-2',
    date: addDays(today, 1),
    items: ['Buy groceries for the week'],
  },
  {
    id: 'evt-3',
    date: addDays(today, 3),
    items: ["Read one chapter of 'Atomic Habits'"]
  },
]

type CalendarCardProps = {
  name?: string
}

export default function CalendarCard({ name = 'Calendar' }: CalendarCardProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(today)
  const [events, setEvents] = useState(generateInitialEvents())
  const [newItem, setNewItem] = useState('')
  const days = generateFutureDays(7)

  const dayEvents = events.find((event) => isSameDay(event.date, selectedDate))?.items ?? []

  const handleAddItem = () => {
    const trimmed = newItem.trim()
    if (!trimmed) return

    setEvents((current) => {
      const existing = current.find((event) => isSameDay(event.date, selectedDate))
      if (existing) {
        return current.map((event) =>
          event === existing ? { ...event, items: [...event.items, trimmed] } : event,
        )
      }
      return [...current, { id: `evt-${Date.now()}`, date: selectedDate, items: [trimmed] }]
    })
    setNewItem('')
  }

  return (
    <Card className="flex h-full flex-col border-0 bg-transparent shadow-none rounded-none">
      <CardHeader>
        <div className="flex items-center gap-3">
          <CalendarDays className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>Select a day and jot down quick notes.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-6">
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const formatted = format(day, 'EEE d')
            const isActive = isSameDay(day, selectedDate)
            const hasItems = events.some((event) => isSameDay(event.date, day))

            return (
              <button
                key={formatted}
                type="button"
                className={
                  'flex h-16 flex-col items-center justify-center rounded border text-xs transition hover:border-primary hover:text-primary ' +
                  (isActive ? 'border-primary bg-primary/10 text-primary' : 'border-border')
                }
                onClick={() => setSelectedDate(day)}
              >
                <span className="font-semibold uppercase">{format(day, 'EEE')}</span>
                <span>{format(day, 'd')}</span>
                {hasItems && <span className="mt-1 h-1 w-8 rounded-full bg-primary" />}
              </button>
            )
          })}
        </div>
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-semibold">Notes for {format(selectedDate, 'EEEE, MMMM d')}</h4>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Add a task or reminder..."
              value={newItem}
              onChange={(event) => setNewItem(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && handleAddItem()}
            />
            <Button onClick={handleAddItem}>Add</Button>
          </div>
          <ul className="space-y-2 text-sm">
            {dayEvents.length === 0 ? (
              <li className="text-muted-foreground">No items for this day yet.</li>
            ) : (
              dayEvents.map((item, index) => (
                <li key={`${item}-${index}`} className="rounded border border-border bg-background/70 p-2">
                  {item}
                </li>
              ))
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
