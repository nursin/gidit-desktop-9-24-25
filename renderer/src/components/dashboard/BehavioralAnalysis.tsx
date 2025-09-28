import { useMemo } from 'react'
import { Activity } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip } from 'recharts'

const weeklyFocusData = [
  { day: 'Mon', hours: 2.5 },
  { day: 'Tue', hours: 3 },
  { day: 'Wed', hours: 1.5 },
  { day: 'Thu', hours: 4 },
  { day: 'Fri', hours: 3.5 },
  { day: 'Sat', hours: 1 },
  { day: 'Sun', hours: 0.5 },
]

const taskDistributionData = [
  { name: 'Work', value: 40 },
  { name: 'Personal', value: 30 },
  { name: 'Home', value: 20 },
  { name: 'Learning', value: 10 },
]

type BehavioralAnalysisProps = {
  name?: string
}

export default function BehavioralAnalysis({ name = 'Behavioral Analysis' }: BehavioralAnalysisProps) {
  const totalTasks = useMemo(
    () => taskDistributionData.reduce((total, entry) => total + entry.value, 0),
    [],
  )

  return (
    <Card className="flex h-full flex-col border-0 bg-transparent shadow-none rounded-none">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Activity className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>Insights into your productivity patterns.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid flex-1 grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <h4 className="text-center text-sm font-semibold">Weekly Focus Sessions</h4>
          <div className="h-48 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyFocusData}>
                <XAxis
                  dataKey="day"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  unit="h"
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }}
                />
                <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <h4 className="text-center text-sm font-semibold">Task Distribution</h4>
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <div className="grid w-full grid-cols-2 gap-3 text-sm">
              {taskDistributionData.map((entry) => {
                const percent = totalTasks ? Math.round((entry.value / totalTasks) * 100) : 0
                return (
                  <div key={entry.name} className="rounded border p-3">
                    <p className="text-sm font-semibold">{entry.name}</p>
                    <p className="text-xs text-muted-foreground">{percent}% of total focus</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
