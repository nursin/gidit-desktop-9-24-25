import { useMemo } from 'react'
import { eachDayOfInterval, format, startOfDay, startOfWeek, subDays } from 'date-fns'
import { Activity } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const TOTAL_DAYS = 112
const DAYS_PER_WEEK = 7

const generateHeatmapData = (days: number) => {
  const today = startOfDay(new Date())
  return Array.from({ length: days }, (_, index) => {
    const date = subDays(today, days - index - 1)
    return {
      date: format(date, 'yyyy-MM-dd'),
      count: Math.floor(Math.random() * 5),
    }
  })
}

const colorScale = ['bg-primary/10', 'bg-primary/30', 'bg-primary/50', 'bg-primary/70', 'bg-primary']

type ActivityHeatmapProps = {
  name?: string
}

export default function ActivityHeatmap({ name = 'Activity Heatmap' }: ActivityHeatmapProps) {
  const values = useMemo(() => generateHeatmapData(TOTAL_DAYS), [])
  const valueMap = useMemo(() => {
    const map = new Map<string, number>()
    values.forEach((value) => map.set(value.date, value.count))
    return map
  }, [values])

  const endDate = startOfDay(new Date())
  const startDate = startOfWeek(subDays(endDate, TOTAL_DAYS - 1))
  const allDays = eachDayOfInterval({ start: startDate, end: endDate })
  const weeks = Array.from({ length: Math.ceil(allDays.length / DAYS_PER_WEEK) }, (_, weekIndex) =>
    allDays.slice(weekIndex * DAYS_PER_WEEK, weekIndex * DAYS_PER_WEEK + DAYS_PER_WEEK),
  )

  const getColorClass = (count: number | undefined) => {
    if (count === undefined || count <= 0) return 'bg-primary/5'
    const clamped = Math.min(count, colorScale.length - 1)
    return colorScale[clamped]
  }

  return (
    <Card className="flex h-full flex-col border-0 bg-transparent shadow-none rounded-none">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Activity className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>Your productivity patterns at a glance.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col items-center justify-center gap-4">
        <div className="w-full overflow-x-auto">
          <div className="mx-auto flex w-fit gap-1">
            {weeks.map((week, index) => (
              <div key={index} className="flex flex-col gap-1">
                {week.map((day) => {
                  const dateKey = format(day, 'yyyy-MM-dd')
                  const count = valueMap.get(dateKey)
                  return (
                    <div
                      key={dateKey}
                      className={`h-3 w-3 rounded-sm ${getColorClass(count)} transition-colors`}
                      title={`${format(day, 'MMM d, yyyy')}: ${count ?? 0} activities`}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="h-3 w-3 rounded-sm bg-primary/5" />
          {colorScale.map((color, index) => (
            <div key={color} className={`h-3 w-3 rounded-sm ${color}`} title={`Level ${index + 1}`} />
          ))}
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  )
}
