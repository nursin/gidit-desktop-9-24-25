import { Item } from './Types'

export type Template = {
  id: string
  name: string
  description: string
  items: Omit<Item, 'id'>[]
}

export const templates: Template[] = [
  {
    id: 'analytics-overview',
    name: 'Analytics Overview',
    description: 'Key performance metrics with a supporting activity feed.',
    items: [
      { widgetId: 'StatsPanel', width: 2, height: 2 },
      { widgetId: 'ProgressAnalytics', width: 2, height: 2 },
      { widgetId: 'RecentTransactions', width: 2, height: 2 },
      { widgetId: 'ActivityHeatmap', width: 2, height: 2 },
    ],
  },
  {
    id: 'focus-dashboard',
    name: 'Focus Dashboard',
    description: 'Plan your day with timers, tasks, and mindful breaks.',
    items: [
      { widgetId: 'NowNextPanel', width: 2, height: 2 },
      { widgetId: 'TimersAndReminders', width: 2, height: 2 },
      { widgetId: 'MindfulMoments', width: 2, height: 1 },
      { widgetId: 'BreakPromptTile', width: 2, height: 1 },
    ],
  },
  {
    id: 'planning-suite',
    name: 'Planning Suite',
    description: 'Comprehensive planning workspace for your week and projects.',
    items: [
      { widgetId: 'WeeklySpread', width: 2, height: 2 },
      { widgetId: 'ProjectPlanner', width: 2, height: 2 },
      { widgetId: 'ToDoList', width: 2, height: 2 },
      { widgetId: 'CalendarCard', width: 2, height: 2 },
    ],
  },
]
