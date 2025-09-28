import { useState, type DragEvent } from 'react'
import { GripVertical, ListChecks, Plus, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

const END_DROP_ID = '__TO_DO_LIST_END__'
const createTaskId = () => crypto.randomUUID()

type Task = {
  id: string
  label: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  tags: string[]
}

const initialTasks: Task[] = [
  { id: createTaskId(), label: 'Finalize presentation deck', completed: false, priority: 'high', tags: ['Work'] },
  { id: createTaskId(), label: 'Schedule dentist appointment', completed: false, priority: 'medium', tags: ['Personal'] },
  { id: createTaskId(), label: 'Buy groceries for the week', completed: true, priority: 'medium', tags: ['Home'] },
  { id: createTaskId(), label: "Read one chapter of 'Atomic Habits'", completed: false, priority: 'low', tags: ['Personal'] },
]

const priorityClasses: Record<Task['priority'], string> = {
  high: 'border-l-4 border-red-500',
  medium: 'border-l-4 border-yellow-500',
  low: 'border-l-4 border-blue-500',
}

type ToDoListProps = {
  name?: string
}

type DragTargetId = string | typeof END_DROP_ID | null

export default function ToDoList({ name = 'To-Do List' }: ToDoListProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [newTaskLabel, setNewTaskLabel] = useState('')
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const [dragOverTaskId, setDragOverTaskId] = useState<DragTargetId>(null)

  const handleAddTask = () => {
    if (newTaskLabel.trim() === '') return

    const newTask: Task = {
      id: createTaskId(),
      label: newTaskLabel,
      completed: false,
      priority: 'medium',
      tags: [],
    }

    setTasks((current) => [newTask, ...current])
    setNewTaskLabel('')
  }

  const handleToggleTask = (id: string) => {
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)),
    )
  }

  const handleRemoveTask = (id: string) => {
    setTasks((current) => current.filter((task) => task.id !== id))
  }

  const handleDragStart = (event: DragEvent<HTMLButtonElement>, id: string) => {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', id)
    setDraggedTaskId(id)
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>, id: DragTargetId) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    if (id !== draggedTaskId) {
      setDragOverTaskId(id)
    }
  }

  const reorderTasks = (sourceId: string, targetId: DragTargetId) => {
    setTasks((current) => {
      const fromIndex = current.findIndex((task) => task.id === sourceId)
      if (fromIndex === -1) {
        return current
      }

      const updated = [...current]
      const [movedTask] = updated.splice(fromIndex, 1)

      if (targetId === END_DROP_ID || targetId === null) {
        updated.push(movedTask)
        return updated
      }

      const targetIndex = current.findIndex((task) => task.id === targetId)
      if (targetIndex === -1) {
        updated.splice(Math.min(fromIndex, updated.length), 0, movedTask)
        return updated
      }

      const insertionIndex = Math.min(targetIndex, updated.length)
      updated.splice(insertionIndex, 0, movedTask)

      return updated
    })
  }

  const finalizeDrag = (targetId: DragTargetId) => {
    if (draggedTaskId) {
      const effectiveTarget = targetId ?? dragOverTaskId

      if (effectiveTarget && draggedTaskId !== effectiveTarget) {
        reorderTasks(draggedTaskId, effectiveTarget)
      } else if (!effectiveTarget) {
        reorderTasks(draggedTaskId, END_DROP_ID)
      }
    }

    setDraggedTaskId(null)
    setDragOverTaskId(null)
  }

  const endDropHighlight = dragOverTaskId === END_DROP_ID

  return (
    <Card className="h-full flex flex-col bg-transparent border-0 shadow-none rounded-none">
      <CardHeader>
        <div className="flex items-center gap-3">
          <ListChecks className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>Stay organized and on track.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-4">
        <div className="flex gap-2">
          <Input
            placeholder="Add a new task..."
            value={newTaskLabel}
            onChange={(event) => setNewTaskLabel(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && handleAddTask()}
          />
          <Button onClick={handleAddTask}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="-mx-6 flex-1">
          <div className="space-y-3 px-6">
            {tasks.map((task) => {
              const isDragging = draggedTaskId === task.id
              const isDragTarget = dragOverTaskId === task.id && draggedTaskId !== task.id

              return (
                <div
                  key={task.id}
                  onDragOver={(event) => handleDragOver(event, task.id)}
                  onDrop={(event) => {
                    event.preventDefault()
                    finalizeDrag(task.id)
                  }}
                  className={cn(
                    'flex items-center gap-3 rounded-md bg-background/50 p-3',
                    priorityClasses[task.priority],
                    isDragTarget && 'ring-2 ring-primary/40',
                    isDragging && 'opacity-60'
                  )}
                >
                  <button
                    type="button"
                    draggable
                    onDragStart={(event) => handleDragStart(event, task.id)}
                    onDragEnd={() => finalizeDrag(dragOverTaskId)}
                    className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition hover:bg-muted cursor-grab active:cursor-grabbing"
                    aria-label="Reorder task"
                  >
                    <GripVertical className="h-4 w-4" />
                  </button>
                  <Checkbox
                    id={`check-${task.id}`}
                    checked={task.completed}
                    onCheckedChange={() => handleToggleTask(task.id)}
                  />
                  <label
                    htmlFor={`check-${task.id}`}
                    className={cn('flex-1 text-sm', task.completed && 'line-through text-muted-foreground')}
                  >
                    {task.label}
                  </label>
                  <div className="flex gap-1">
                    {task.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRemoveTask(task.id)}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              )
            })}
            <div
              onDragOver={(event) => handleDragOver(event, END_DROP_ID)}
              onDrop={(event) => {
                event.preventDefault()
                finalizeDrag(END_DROP_ID)
              }}
              className={cn('h-8 rounded-md border border-dashed border-transparent transition', endDropHighlight && 'border-primary/50 bg-primary/5')}
            />
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
