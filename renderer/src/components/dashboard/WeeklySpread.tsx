import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core'
import { addDays, format } from 'date-fns'
import { CalendarDays, GripVertical } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const createId = () => crypto.randomUUID()

type Task = {
  id: string
  content: string
  dayId: string
}

type Day = {
  id: string
  title: string
  date: Date
}

const today = new Date()
const initialDays: Day[] = Array.from({ length: 7 }).map((_, index) => ({
  id: `day-${index}`,
  title: format(addDays(today, index), 'EEEE'),
  date: addDays(today, index),
}))

const initialTasks: Task[] = [
  { id: createId(), dayId: 'day-0', content: 'Team Standup' },
  { id: createId(), dayId: 'day-1', content: 'Review PRs' },
  { id: createId(), dayId: 'day-1', content: 'Design meeting' },
  { id: createId(), dayId: 'day-2', content: 'Focus block: feature dev' },
  { id: createId(), dayId: 'day-4', content: 'Deploy to staging' },
]

type TaskCardProps = {
  task: Task
}

function TaskCard({ task }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
  })

  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 rounded-md bg-background/80 p-2 text-sm shadow-sm transition',
        isDragging && 'opacity-50',
      )}
    >
      <button
        type="button"
        className="cursor-grab touch-none"
        {...attributes}
        {...listeners}
        aria-label="Drag task"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>
      <p className="flex-1 text-xs">{task.content}</p>
    </div>
  )
}

type DayColumnProps = {
  day: Day
  tasks: Task[]
}

function DayColumn({ day, tasks }: DayColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: day.id,
    data: {
      type: 'Day',
    },
  })

  const isToday = format(day.date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex min-h-[120px] flex-col gap-3 rounded-lg bg-background/30 p-2 transition',
        isOver && 'ring-2 ring-primary/40',
      )}
    >
      <div className="text-center text-sm font-semibold">
        <span className={cn(isToday && 'text-primary')}>{day.title}</span>
        <p className="text-xs font-normal text-muted-foreground">{format(day.date, 'MMM d')}</p>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  )
}

type WeeklySpreadProps = {
  name?: string
}

export default function WeeklySpread({ name = 'Weekly Spread' }: WeeklySpreadProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  )

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'Task') {
      setActiveTask(event.active.data.current.task ?? null)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null)
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    const isActiveTask = active.data.current?.type === 'Task'
    const isOverDay = over.data?.current?.type === 'Day'

    if (!isActiveTask || !isOverDay) return

    setTasks((current) =>
      current.map((task) =>
        task.id === activeId ? { ...task, dayId: overId as string } : task,
      ),
    )
  }

  return (
    <Card className="flex h-full flex-col border-0 bg-transparent shadow-none rounded-none">
      <CardHeader>
        <div className="flex items-center gap-3">
          <CalendarDays className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>Plan your week at a glance.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-x-auto">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          collisionDetection={closestCorners}
        >
          <div className="grid h-full grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-7">
            {initialDays.map((day) => (
              <DayColumn key={day.id} day={day} tasks={tasks.filter((task) => task.dayId === day.id)} />
            ))}
          </div>
          <DragOverlay>{activeTask ? <TaskCard task={activeTask} /> : null}</DragOverlay>
        </DndContext>
      </CardContent>
    </Card>
  )
}
