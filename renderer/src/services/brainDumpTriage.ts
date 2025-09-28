export type TriageBrainDumpOutput = {
  tasks: string[]
  notes: string[]
  calendarEvents: string[]
  finance: string[]
}

const KEYWORD_MAP: Record<string, Array<keyof TriageBrainDumpOutput>> = {
  pay: ['finance'],
  invoice: ['finance'],
  budget: ['finance'],
  bill: ['finance'],
  meeting: ['calendarEvents'],
  call: ['calendarEvents'],
  schedule: ['calendarEvents'],
  event: ['calendarEvents'],
  remember: ['notes'],
  idea: ['notes'],
  note: ['notes'],
  plan: ['tasks'],
  finish: ['tasks'],
  email: ['tasks'],
  task: ['tasks'],
}

const DEFAULT_OUTPUT: TriageBrainDumpOutput = {
  tasks: [],
  notes: [],
  calendarEvents: [],
  finance: [],
}

const sentenceSplitPattern = /[\.!?\n]+\s*/

const assignCategory = (entry: string): keyof TriageBrainDumpOutput => {
  const lower = entry.toLowerCase()
  for (const [keyword, categories] of Object.entries(KEYWORD_MAP)) {
    if (lower.includes(keyword)) {
      return categories[0]
    }
  }
  if (lower.includes('pay') || lower.includes('budget')) return 'finance'
  return 'notes'
}

export async function triageBrainDump({
  brainDump,
}: {
  brainDump: string
}): Promise<TriageBrainDumpOutput> {
  if (!brainDump.trim()) return { ...DEFAULT_OUTPUT }

  const output: TriageBrainDumpOutput = {
    tasks: [],
    notes: [],
    calendarEvents: [],
    finance: [],
  }

  brainDump
    .split(sentenceSplitPattern)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .forEach((entry) => {
      const category = assignCategory(entry)
      output[category].push(entry)
    })

  return output
}
