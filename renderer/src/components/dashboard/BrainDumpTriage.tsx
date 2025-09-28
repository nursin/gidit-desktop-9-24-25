"use client"

import { useMemo, useState, useTransition, type ReactNode } from 'react'
import { v4 as uuidv4 } from 'uuid'
import {
  BrainCircuit,
  Loader2,
  Book,
  Calendar,
  ClipboardCheck,
  DollarSign,
  GripVertical,
  Mic,
  MicOff,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { triageBrainDump, type TriageBrainDumpOutput } from '@/services/brainDumpTriage'
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition'

type BrainDumpTriageProps = {
  name?: string
}

type TriageItem = {
  id: string
  content: string
  category: keyof TriageBrainDumpOutput
}

type ColumnConfig = {
  id: keyof TriageBrainDumpOutput
  title: string
  icon: ReactNode
}

type DraggableItemProps = {
  item: TriageItem
  onDragStart: (id: string) => void
  onDragEnd: () => void
  isActive: boolean
}

type DropColumnProps = {
  column: ColumnConfig
  items: TriageItem[]
  onDropItem: (itemId: string, category: keyof TriageBrainDumpOutput) => void
  onDragStart: (id: string) => void
  onDragEnd: () => void
  draggingId: string | null
}

const ICON_MAP: Record<keyof TriageBrainDumpOutput, ReactNode> = {
  tasks: <ClipboardCheck className="h-5 w-5 text-primary" />,
  notes: <Book className="h-5 w-5 text-primary" />,
  calendarEvents: <Calendar className="h-5 w-5 text-primary" />,
  finance: <DollarSign className="h-5 w-5 text-primary" />,
}

function DraggableItem({ item, onDragStart, onDragEnd, isActive }: DraggableItemProps) {
  return (
    <div
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData('text/plain', item.id)
        event.dataTransfer.effectAllowed = 'move'
        onDragStart(item.id)
      }}
      onDragEnd={onDragEnd}
      className={cn(
        'flex cursor-grab items-center gap-2 border border-border bg-background p-2 shadow-sm transition active:cursor-grabbing',
        isActive && 'opacity-70',
      )}
    >
      <GripVertical className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
      <p className="flex-1 text-xs leading-snug">{item.content}</p>
    </div>
  )
}

function DropColumn({ column, items, onDropItem, draggingId, onDragStart, onDragEnd }: DropColumnProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      onDragOver={(event) => {
        if (event.dataTransfer.types.includes('text/plain')) {
          event.preventDefault()
        }
      }}
      onDragEnter={(event) => {
        if (event.dataTransfer.types.includes('text/plain')) {
          setIsHovered(true)
        }
      }}
      onDragLeave={(event) => {
        const nextTarget = event.relatedTarget as Node | null
        if (!event.currentTarget.contains(nextTarget)) {
          setIsHovered(false)
        }
      }}
      onDrop={(event) => {
        event.preventDefault()
        const id = event.dataTransfer.getData('text/plain')
        if (id) {
          onDropItem(id, column.id)
        }
        setIsHovered(false)
      }}
      className={cn(
        'min-h-[120px] border border-border bg-secondary/60 p-3 transition',
        isHovered && 'ring-2 ring-primary/40',
      )}
    >
      <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold capitalize">
        {column.icon}
        {column.title}
      </h3>
      <div className="space-y-2">
        {items.map((item) => (
          <DraggableItem
            key={item.id}
            item={item}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            isActive={draggingId === item.id}
          />
        ))}
        {items.length === 0 && (
          <p className="text-xs italic text-muted-foreground">Drop items here</p>
        )}
      </div>
    </div>
  )
}

export default function BrainDumpTriage({ name = 'Brain Dump Triage' }: BrainDumpTriageProps) {
  const [brainDump, setBrainDump] = useState('')
  const [items, setItems] = useState<TriageItem[]>([])
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const { isRecording, start, stop, isSupported } = useVoiceRecognition({
    onTranscriptChange: (nextTranscript) => {
      setBrainDump((prev) => (prev ? `${prev} ${nextTranscript}` : nextTranscript))
    },
  })

  const columns = useMemo<ColumnConfig[]>(
    () => [
      { id: 'tasks', title: 'Tasks', icon: ICON_MAP.tasks },
      { id: 'notes', title: 'Notes', icon: ICON_MAP.notes },
      { id: 'calendarEvents', title: 'Calendar Events', icon: ICON_MAP.calendarEvents },
      { id: 'finance', title: 'Finance', icon: ICON_MAP.finance },
    ],
    [],
  )

  const categorizedItems = useMemo(() => {
    return columns.map((column) => ({
      column,
      items: items.filter((item) => item.category === column.id),
    }))
  }, [columns, items])

  const handleTriage = () => {
    if (!brainDump.trim()) return

    startTransition(async () => {
      const result = await triageBrainDump({ brainDump })
      const nextItems: TriageItem[] = []
      ;(Object.keys(result) as Array<keyof TriageBrainDumpOutput>).forEach((category) => {
        result[category].forEach((content) => {
          nextItems.push({ id: uuidv4(), content, category })
        })
      })
      setItems(nextItems)
      setDraggingId(null)
    })
  }

  const handleDropItem = (itemId: string, category: keyof TriageBrainDumpOutput) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item
        if (item.category === category) return item
        return { ...item, category }
      }),
    )
    setDraggingId(null)
  }

  const handleDragStart = (id: string) => setDraggingId(id)
  const handleDragEnd = () => setDraggingId(null)

  return (
    <Card className="flex h-full flex-col border-0 rounded-none">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <BrainCircuit className="h-6 w-6 text-primary" />
            <div>
              <CardTitle className="text-xl">{name}</CardTitle>
              <CardDescription>Let AI sort your thoughts.</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-4">
        <Textarea
          placeholder="Pour your thoughts here..."
          className="min-h-[60px] flex-grow resize-none text-sm"
          value={brainDump}
          onChange={(event) => setBrainDump(event.target.value)}
        />
        <div className="flex gap-2">
          <Button onClick={handleTriage} disabled={isPending || !brainDump.trim()} className="flex-grow">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Triage Now
          </Button>
          <Button
            onClick={isRecording ? stop : start}
            variant={isRecording ? 'destructive' : 'outline'}
            size="icon"
            disabled={!isSupported}
            title={isSupported ? undefined : 'Voice capture is not supported in this browser'}
          >
            {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
        </div>
        {items.length > 0 && (
          <ScrollArea className="flex-1">
            <div className="mt-2 grid gap-4 pr-6 md:grid-cols-2">
              {categorizedItems.map(({ column, items: columnItems }) => (
                <DropColumn
                  key={column.id}
                  column={column}
                  items={columnItems}
                  onDropItem={handleDropItem}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  draggingId={draggingId}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
