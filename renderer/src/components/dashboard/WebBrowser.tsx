"use client"

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { Globe, ArrowLeft, ArrowRight, RotateCw, Plus, X } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface Tab {
  id: string
  history: string[]
  historyIndex: number
}

const DEFAULT_START_URL = 'https://www.google.com/webhp?igu=1'

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2)
}

const createNewTab = (): Tab => ({
  id: createId(),
  history: [DEFAULT_START_URL],
  historyIndex: 0,
})

const sanitizeUrl = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return DEFAULT_START_URL
  if (/^(https?:\/\/|about:blank|data:)/i.test(trimmed)) {
    return trimmed
  }
  return `https://${trimmed}`
}

const getTabTitle = (tab: Tab) => {
  const current = tab.history[tab.historyIndex]
  try {
    const url = new URL(current)
    return url.hostname.replace(/^www\./i, '') || 'New Tab'
  } catch (error) {
    console.warn('[browser] invalid url, using fallback title', error)
    return 'New Tab'
  }
}

export default function WebBrowser({ name = 'Web Browser' }: { name?: string }) {
  const [tabs, setTabs] = useState<Tab[]>(() => [createNewTab()])
  const [activeTabId, setActiveTabId] = useState<string>(() => tabs[0].id)
  const activeTab = useMemo(() => tabs.find((tab) => tab.id === activeTabId) ?? tabs[0], [tabs, activeTabId])
  const currentUrl = activeTab.history[activeTab.historyIndex]
  const [inputValue, setInputValue] = useState(currentUrl)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    setInputValue(currentUrl)
  }, [currentUrl])

  const updateTab = (tabId: string, updates: Partial<Tab>) => {
    setTabs((prev) => prev.map((tab) => (tab.id === tabId ? { ...tab, ...updates } : tab)))
  }

  const navigateTo = (rawUrl: string) => {
    const nextUrl = sanitizeUrl(rawUrl)
    const nextHistory = activeTab.history.slice(0, activeTab.historyIndex + 1)
    nextHistory.push(nextUrl)
    updateTab(activeTab.id, {
      history: nextHistory,
      historyIndex: nextHistory.length - 1,
    })
    setInputValue(nextUrl)
  }

  const goBack = () => {
    if (activeTab.historyIndex === 0) return
    updateTab(activeTab.id, { historyIndex: activeTab.historyIndex - 1 })
  }

  const goForward = () => {
    if (activeTab.historyIndex >= activeTab.history.length - 1) return
    updateTab(activeTab.id, { historyIndex: activeTab.historyIndex + 1 })
  }

  const reload = () => {
    const frame = iframeRef.current
    if (!frame) return
    const target = activeTab.history[activeTab.historyIndex]
    frame.src = 'about:blank'
    setTimeout(() => {
      if (iframeRef.current) {
        iframeRef.current.src = target
      }
    }, 50)
  }

  const handleSubmit = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      navigateTo(inputValue)
    }
  }

  const addTab = () => {
    const newTab = createNewTab()
    setTabs((prev) => [...prev, newTab])
    setActiveTabId(newTab.id)
  }

  const closeTab = (tabId: string) => {
    setTabs((prevTabs) => {
      if (prevTabs.length === 1) {
        const replacement = createNewTab()
        setActiveTabId(replacement.id)
        return [replacement]
      }

      const index = prevTabs.findIndex((tab) => tab.id === tabId)
      const filtered = prevTabs.filter((tab) => tab.id !== tabId)
      if (activeTabId === tabId) {
        const fallbackIndex = Math.max(0, index - 1)
        setActiveTabId(filtered[fallbackIndex]?.id ?? filtered[0].id)
      }
      return filtered
    })
  }

  return (
    <Card className="flex h-full flex-col border-0 bg-transparent shadow-none">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <Globe className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>Browse the web within your workspace.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-2">
        <div className="flex items-center gap-1 border-b">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={cn(
                'relative flex cursor-pointer select-none items-center gap-1.5 border-r px-3 py-2 text-sm transition-colors',
                activeTabId === tab.id ? 'bg-background/80 text-foreground' : 'bg-secondary text-muted-foreground hover:bg-background/50 hover:text-foreground',
              )}
            >
              <span className="max-w-[120px] truncate">{getTabTitle(tab)}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 rounded-full"
                onClick={(event) => {
                  event.stopPropagation()
                  closeTab(tab.id)
                }}
                aria-label="Close tab"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
          <Button variant="ghost" size="icon" onClick={addTab} className="ml-1 h-8 w-8" aria-label="Add tab">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 rounded-md border bg-background/70 p-2">
          <Button variant="ghost" size="icon" onClick={goBack} disabled={activeTab.historyIndex === 0} aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={goForward}
            disabled={activeTab.historyIndex >= activeTab.history.length - 1}
            aria-label="Forward"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={reload} aria-label="Reload">
            <RotateCw className="h-4 w-4" />
          </Button>
          <Input
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={handleSubmit}
            placeholder="https://example.com"
            className="h-9"
            aria-label="Address bar"
          />
        </div>

        <div className="flex-1 overflow-hidden rounded-md border bg-background">
          <iframe
            ref={iframeRef}
            key={currentUrl}
            src={currentUrl}
            title="Embedded browser"
            className="h-full w-full"
            sandbox="allow-forms allow-modals allow-popups allow-same-origin allow-scripts"
          />
        </div>
      </CardContent>
    </Card>
  )
}
