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
import { Clock } from 'lucide-react'
import { format } from 'date-fns'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const createId = () => crypto.randomUUID()

type Task = {
  id: string
  content: string
  timeSlotId: string | null
  duration: number
}

type TimeSlot = {
  id: string
  time: string
}

const initialTimeSlots: TimeSlot[] = Array.from({ length: 10 }).map((_, index) => ({
  id: `slot-${index}`,
  time: `${index + 8}:00`,
}))

const initialTasks: Task[] = [
  { id: createId(), timeSlotId: null, content: 'Review project brief', duration: 60 },
  { id: createId(), timeSlotId: 'slot-2', content: 'Team sync meeting', duration: 45 },
  { id: createId(), timeSlotId: null, content: 'Design mockups', duration: 120 },
  { id: createId(), timeSlotId: null, content: 'Code review', duration: 60 },
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
        'flex items-center gap-2 border border-border bg-background/80 p-2 text-xs shadow-sm transition',
        isDragging && 'opacity-50',
      )}
      {...attributes}
      {...listeners}
    >
      <p className="flex-1 font-medium">{task.content}</p>
      <p className="text-muted-foreground">{task.duration}m</p>
    </div>
  )
}

type TimeSlotRowProps = {
  timeSlot: TimeSlot
  tasks: Task[]
}

function TimeSlotRow({ timeSlot, tasks }: TimeSlotRowProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: timeSlot.id,
    data: {
      type: 'TimeSlot',
    },
  })

  return (
    <div className="flex items-start border-t border-border first:border-t-0">
      <div className="border-r border-border p-2 text-xs text-muted-foreground">
        {timeSlot.time}
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 space-y-2 p-2 transition',
          isOver && 'ring-2 ring-primary/40',
        )}
      >
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
        {tasks.length === 0 && <p className="text-[11px] italic text-muted-foreground">Drop a task here</p>}
      </div>
    </div>
  )
}

type TimeBlockPlannerProps = {
  name?: string
}

export default function TimeBlockPlanner({ name = 'Time Block Planner' }: TimeBlockPlannerProps) {
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

    const isOverTimeSlot = over.data?.current?.type === 'TimeSlot'

    if (!isOverTimeSlot) return

    setTasks((current) =>
      current.map((task) =>
        task.id === activeId ? { ...task, timeSlotId: overId as string } : task,
      ),
    )
  }

  return (
    <Card className="flex h-full flex-col border-0 bg-transparent shadow-none rounded-none">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Clock className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>Plan your day: {format(new Date(), 'EEEE, MMMM d')}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-auto">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          collisionDetection={closestCorners}
        >
          <div className="border border-border bg-background/20">
            {initialTimeSlots.map((slot) => (
              <TimeSlotRow
                key={slot.id}
                timeSlot={slot}
                tasks={tasks.filter((task) => task.timeSlotId === slot.id)}
              />
            ))}
          </div>
          <DragOverlay>{activeTask ? <TaskCard task={activeTask} /> : null}</DragOverlay>
        </DndContext>
      </CardContent>
    </Card>
  )
}
