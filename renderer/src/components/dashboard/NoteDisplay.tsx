'use client'

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { Notebook, PlusCircle, RefreshCw, Loader2, Trash2, Wand2 } from 'lucide-react'

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/useToast'

const createId = () => crypto.randomUUID()

type Note = {
  id: string
  title: string
  rawNotes: string
  organizedNotes: string
  strategicPlan: string
}

type NoteDisplayProps = {
  name?: string
  rawNotes?: string
  organizedNotes?: string
  onSaveNoteAsPage?: (note: { title: string; rawNotes: string; organizedNotes: string }) => void
}

type OrganizeNotesResult = {
  organizedNotes: string
}

type ProcessNotesResult = {
  summary: string
  strategicPlan: string[]
  tasks: { task: string; timeToComplete: string; goal: string }[]
}

// Lightweight markdown to HTML converter tailored for dashboard previews
const markdownToHtml = (markdown: string) => {
  if (!markdown) return ''

  let html = markdown
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

  html = html
    .replace(/^### (.*$)/gim, '<h3 class="mt-4 mb-2 text-lg font-semibold">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="mt-6 mb-3 border-b pb-2 text-xl font-bold">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="mt-8 mb-4 border-b-2 pb-2 text-2xl font-bold">$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/\[src: (.*?)\]\((.*?)\)/gim, '<a href="$2" class="src-link rounded-sm bg-primary/10 p-1 text-xs text-primary transition-colors hover:underline">[$1]</a>')
    .replace(/`([^`]+)`/gim, '<code class="rounded-sm bg-secondary px-1 py-0.5 text-sm">$1</code>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/^\* (.*$)/gim, '<li>$1</li>')
    .replace(/<\/li><li>/gim, '</li><li>')
    .replace(/\n/g, '<br />')
    .replace(/<br \/><li>/gim, '<li>')
    .replace(/<\/li><br \/>/gim, '</li>')

  return html
}

const createAnchoredRawNotes = (notes: string) =>
  notes
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/^(N\d+)/gim, '<span id="note-$1">$1</span>')
    .replace(/\n/g, '<br />')

const organizeNotesFallback = async ({ notes }: { notes: string; goal: string; maxMinutes: number }): Promise<OrganizeNotesResult> => {
  const trimmed = notes.trim()
  return {
    organizedNotes: trimmed
      ? `## Key Points\n- ${trimmed.split(/\n+/).map((line) => line.trim()).filter(Boolean).join('\n- ')}`
      : 'No organized notes available yet.',
  }
}

const processNotesFallback = async ({ notes }: { notes: string }): Promise<ProcessNotesResult> => {
  const trimmed = notes.trim()
  const lines = trimmed ? trimmed.split(/\n+/).map((line) => line.trim()).filter(Boolean) : []
  return {
    summary: lines.slice(0, 3).join(' '),
    strategicPlan: lines.slice(0, 5).map((line, index) => `${index + 1}. ${line}`),
    tasks: lines.slice(0, 3).map((line, index) => ({
      task: line,
      timeToComplete: `${30 + index * 15}m`,
      goal: 'Focus',
    })),
  }
}

type NoteContentProps = {
  note: Note
  onNoteUpdate: (noteId: string, updates: Partial<Note>) => void
}

function NoteContent({ note, onNoteUpdate }: NoteContentProps) {
  const briefContentRef = useRef<HTMLDivElement>(null)
  const rawContentRef = useRef<HTMLDivElement>(null)
  const [isOrganizing, startOrganizeTransition] = useTransition()
  const [isStrategizing, startStrategizeTransition] = useTransition()
  const [activeTab, setActiveTab] = useState<'organized' | 'strategized' | 'raw'>('raw')
  const { toast } = useToast()

  useEffect(() => {
    const handleLinkClick = (event: MouseEvent) => {
      const target = event.target as HTMLAnchorElement | null
      if (!target?.classList.contains('src-link') || !target.hash) return

      event.preventDefault()
      const targetId = target.hash.slice(1)
      setActiveTab('raw')

      window.setTimeout(() => {
        const container = rawContentRef.current
        if (!container) return
        const anchor = container.querySelector<HTMLElement>(`#${targetId}`)
        if (!anchor) return
        anchor.scrollIntoView({ behavior: 'smooth', block: 'center' })
        anchor.classList.add('bg-yellow-200', 'dark:bg-yellow-800', 'p-1', '-m-1', 'rounded-sm', 'transition-all', 'duration-1000')
        window.setTimeout(() => {
          anchor.classList.remove('bg-yellow-200', 'dark:bg-yellow-800', 'p-1', '-m-1', 'rounded-sm', 'transition-all', 'duration-1000')
        }, 2_000)
      }, 100)
    }

    const content = briefContentRef.current
    content?.addEventListener('click', handleLinkClick)
    return () => content?.removeEventListener('click', handleLinkClick)
  }, [note.id])

  const handleOrganize = () => {
    startOrganizeTransition(async () => {
      try {
        const snapshot = rawContentRef.current?.innerText ?? note.rawNotes
        onNoteUpdate(note.id, { rawNotes: snapshot })
        const result = await organizeNotesFallback({ notes: snapshot, goal: `Refine notes for: ${note.title}`, maxMinutes: 5 })
        onNoteUpdate(note.id, { organizedNotes: result.organizedNotes })
        toast({ title: 'Brief updated', description: 'Your structured brief has been refreshed.' })
      } catch (error) {
        toast({ title: 'Error', description: 'Could not organize notes.', variant: 'destructive' })
      }
    })
  }

  const handleStrategize = () => {
    startStrategizeTransition(async () => {
      try {
        const snapshot = rawContentRef.current?.innerText ?? note.rawNotes
        onNoteUpdate(note.id, { rawNotes: snapshot })
        const result = await processNotesFallback({ notes: snapshot })
        const strategicMarkdown = `# Strategic Plan for: ${note.title}\n\n## Summary\n${result.summary || 'No summary available.'}\n\n## Strategic Plan\n${result.strategicPlan.length ? result.strategicPlan.map((entry) => `- ${entry}`).join('\n') : '- No steps generated.'}\n\n## Actionable Tasks\n| Task | Time to Complete | Goal |\n|---|---|---|\n${result.tasks.length ? result.tasks.map((task) => `| ${task.task} | ${task.timeToComplete} | ${task.goal} |`).join('\n') : '| No tasks | -- | -- |'}`
        onNoteUpdate(note.id, { strategicPlan: strategicMarkdown })
        toast({ title: 'Strategy generated', description: 'A new strategic plan has been created.' })
      } catch (error) {
        toast({ title: 'Error', description: 'Could not generate strategy.', variant: 'destructive' })
      }
    })
  }

  const handleRawNotesBlur = (event: React.FormEvent<HTMLDivElement>) => {
    onNoteUpdate(note.id, { rawNotes: event.currentTarget.innerText })
  }

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="flex h-full flex-col">
      <div className="flex flex-shrink-0 items-center justify-between gap-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="organized">Structured Brief</TabsTrigger>
          <TabsTrigger value="strategized">Strategic Plan</TabsTrigger>
          <TabsTrigger value="raw">Original Notes</TabsTrigger>
        </TabsList>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleOrganize} disabled={isOrganizing}>
            {isOrganizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Organize
          </Button>
          <Button variant="outline" size="sm" onClick={handleStrategize} disabled={isStrategizing}>
            {isStrategizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Strategize
          </Button>
        </div>
      </div>

      <TabsContent value="organized" className="mt-2 flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          <div
            ref={briefContentRef}
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(note.organizedNotes) }}
          />
        </ScrollArea>
      </TabsContent>

      <TabsContent value="strategized" className="mt-2 flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          <div
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(note.strategicPlan) }}
          />
        </ScrollArea>
      </TabsContent>

      <TabsContent value="raw" className="mt-2 flex-1 overflow-hidden">
        <ScrollArea className="h-full border border-border bg-secondary/30">
          <div
            ref={rawContentRef}
            contentEditable
            suppressContentEditableWarning
            onBlur={handleRawNotesBlur}
            className="h-full w-full whitespace-pre-wrap bg-transparent p-2 text-sm text-muted-foreground focus-visible:outline-none focus-visible:ring-0"
            dangerouslySetInnerHTML={{ __html: createAnchoredRawNotes(note.rawNotes) }}
          />
        </ScrollArea>
      </TabsContent>
    </Tabs>
  )
}

export default function NoteDisplay({
  name: initialTitle = 'Saved Note',
  rawNotes = 'No raw notes provided.',
  organizedNotes = 'No organized brief provided.',
}: NoteDisplayProps) {
  const [notes, setNotes] = useState<Note[]>(() => [
    {
      id: createId(),
      title: initialTitle,
      rawNotes,
      organizedNotes,
      strategicPlan: '### Strategic Plan\nYour strategic plan will appear here after processing.',
    },
  ])
  const [activeNoteId, setActiveNoteId] = useState<string>(() => notes[0]?.id ?? '')

  const activeNote = useMemo(() => notes.find((note) => note.id === activeNoteId), [notes, activeNoteId])

  const handleAddNote = () => {
    const newNote: Note = {
      id: createId(),
      title: `New Note ${notes.length + 1}`,
      rawNotes: 'Start typing your raw notes here...',
      organizedNotes: '### New Note\nYour organized brief will appear here after processing.',
      strategicPlan: '### Strategic Plan\nYour strategic plan will appear here after processing.',
    }
    setNotes((current) => [...current, newNote])
    setActiveNoteId(newNote.id)
  }

  const handleNoteUpdate = (noteId: string, updates: Partial<Note>) => {
    setNotes((current) => current.map((note) => (note.id === noteId ? { ...note, ...updates } : note)))
  }

  const handleDeleteNote = (noteId: string) => {
    setNotes((current) => {
      const filtered = current.filter((note) => note.id !== noteId)
      if (activeNoteId === noteId) {
        setActiveNoteId(filtered[0]?.id ?? '')
      }
      return filtered
    })
  }

  return (
    <Card className="flex h-full flex-col border-0 bg-transparent shadow-none rounded-none">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Notebook className="h-6 w-6 text-primary" />
            <div>
              {activeNote ? (
                <Input
                  value={activeNote.title}
                  onChange={(event) => handleNoteUpdate(activeNote.id, { title: event.target.value })}
                  className="h-auto border-none p-0 text-2xl font-semibold leading-none tracking-tight focus-visible:ring-0"
                />
              ) : (
                <CardTitle>Notes</CardTitle>
              )}
              <CardDescription>A collection of your saved and processed notes.</CardDescription>
            </div>
          </div>
          {activeNote && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Note
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this note?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete "{activeNote.title}". This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDeleteNote(activeNote.id)}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="min-h-0 flex-1">
        <div className="flex h-full gap-4">
          <div className="flex w-1/4 flex-col border-r border-border pr-4">
            <Button onClick={handleAddNote} className="mb-4 w-full" variant="outline">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Note
            </Button>
            <ScrollArea className="h-[calc(100%-3.25rem)]">
              <div className="flex flex-col gap-2 pr-2">
                {notes.map((note) => (
                  <button
                    key={note.id}
                    type="button"
                    onClick={() => setActiveNoteId(note.id)}
                    className={cn(
                      'w-full truncate border border-transparent px-2 py-1 text-left text-sm transition-colors',
                      activeNoteId === note.id
                        ? 'border-primary bg-primary/10 font-semibold text-primary'
                        : 'hover:bg-accent hover:text-accent-foreground',
                    )}
                  >
                    {note.title}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="w-3/4">
            {activeNote ? (
              <NoteContent note={activeNote} onNoteUpdate={handleNoteUpdate} />
            ) : (
              <div className="pt-12 text-center text-muted-foreground">
                <p>No notes found.</p>
                <p className="text-sm">Click "New Note" to get started.</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
