"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react"
import type { LucideIcon } from "lucide-react"
import {
  ArrowLeft,
  ArrowRight,
  BatteryCharging,
  Globe,
  Image as ImageIcon,
  Maximize2,
  Minimize2,
  Minus,
  Music,
  PlaySquare,
  Plus,
  RotateCw,
  Search,
  Settings as SettingsIcon,
  TerminalSquare,
  Volume2,
  Wifi,
  X,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface DesktopApp {
  id: string
  name: string
  description: string
  icon: LucideIcon
  accent: string
  content: ReactNode
}

interface DesktopWindow {
  appId: string
  minimized: boolean
  maximized: boolean
  position: { x: number; y: number }
  size?: { width: number; height: number }
  lastLayout?: {
    position: { x: number; y: number }
    size?: { width: number; height: number }
  }
  zIndex: number
}

const AURORA_DEFAULT_URL = "https://duckduckgo.com/?q=productivity+workflow"

const normalizeUrl = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return AURORA_DEFAULT_URL
  if (/^(https?:\/\/|about:blank)/i.test(trimmed)) {
    return trimmed
  }
  const hasDot = trimmed.includes(".")
  const hasSpace = trimmed.includes(" ")
  const looksLikeUrl = hasDot && !hasSpace
  if (looksLikeUrl) {
    return `https://${trimmed}`
  }
  return `https://duckduckgo.com/?q=${encodeURIComponent(trimmed)}`
}

function AuroraBrowser() {
  const [history, setHistory] = useState<string[]>(() => [AURORA_DEFAULT_URL])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [inputValue, setInputValue] = useState(() => history[0])
  const [showSearch, setShowSearch] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  const currentUrl = history[historyIndex] ?? AURORA_DEFAULT_URL

  useEffect(() => {
    setInputValue(currentUrl)
  }, [currentUrl])

  // Listen for a custom event from the window title bar to toggle search
  useEffect(() => {
    const handler = () => setShowSearch((v) => !v)
    document.addEventListener("toggle-aurora-search", handler as EventListener)
    return () =>
      document.removeEventListener(
        "toggle-aurora-search",
        handler as EventListener
      )
  }, [])

  const commitNavigation = (nextUrl: string) => {
    setHistory((prev) => {
      const base = prev.slice(0, historyIndex + 1)
      if (base[base.length - 1] === nextUrl) {
        setHistoryIndex(base.length - 1)
        return base
      }
      const updated = [...base, nextUrl]
      setHistoryIndex(updated.length - 1)
      return updated
    })
  }

  const navigateTo = (raw: string) => {
    const target = normalizeUrl(raw)
    commitNavigation(target)
    const view = iframeRef.current
    if (view) view.src = target
  }

  const goBack = () => {
    if (historyIndex === 0) return
    const nextIndex = historyIndex - 1
    setHistoryIndex(nextIndex)
    const view = iframeRef.current
    if (view) view.src = history[nextIndex]
  }

  const goForward = () => {
    if (historyIndex >= history.length - 1) return
    const nextIndex = historyIndex + 1
    setHistoryIndex(nextIndex)
    const view = iframeRef.current
    if (view) view.src = history[nextIndex]
  }

  const reload = () => {
    const view = iframeRef.current
    if (!view) return
    const url = history[historyIndex]
    view.src = "about:blank"
    window.setTimeout(() => {
      if (iframeRef.current) {
        iframeRef.current.src = url
      }
    }, 40)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      navigateTo(inputValue)
    }
  }

  return (
    <div className="flex min-h-full flex-col gap-3 text-slate-200">
      {/* Moved toolbar into window top bar; show inline search only when toggled */}
      {showSearch && (
        <div className="rounded-2xl border border-white/10 bg-slate-950/50 backdrop-blur">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/80 p-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-200"
              disabled={historyIndex === 0}
              onClick={goBack}
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-200"
              disabled={historyIndex >= history.length - 1}
              onClick={goForward}
              aria-label="Go forward"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-200"
              onClick={reload}
              aria-label="Reload"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
            <Input
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search the web or enter URL"
              className="h-9 flex-1 border-white/10 bg-slate-900/70 text-xs text-white placeholder:text-white/40"
            />
            <Button
              variant="secondary"
              className="h-9 rounded-xl bg-emerald-500 text-xs font-semibold text-white hover:bg-emerald-400"
              onClick={() => navigateTo(inputValue)}
            >
              Search
            </Button>
          </div>
        </div>
      )}
      <div className="flex-1 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40 backdrop-blur-xl">
        <iframe
          ref={iframeRef}
          src={currentUrl}
          title="Aurora Browser"
          sandbox="allow-forms allow-popups allow-scripts allow-same-origin"
          className="h-full w-full rounded-2xl bg-white/5"
        />
      </div>
      {showSearch && (
        <p className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[0.7rem] text-white/70">
          Hint: Use quick queries like{" "}
          <span className="font-semibold text-white/90">"gidit productivity"</span>{" "}
          or paste any URL to jump directly.
        </p>
      )}
    </div>
  )
}

const DESKTOP_APPS: DesktopApp[] = [
  {
    id: "browser",
    name: "Aurora Browser",
    description: "",
    icon: Globe,
    accent: "text-sky-400",
    content: <AuroraBrowser />,
  },
  {
    id: "terminal",
    name: "Nebula Terminal",
    description: "Run quick commands without leaving focus mode.",
    icon: TerminalSquare,
    accent: "text-emerald-400",
    content: (
      <div className="rounded-xl border border-emerald-400/20 bg-slate-950 text-emerald-200">
        <div className="flex items-center gap-2 border-b border-emerald-400/20 px-4 py-2 text-xs uppercase tracking-[0.3em] text-emerald-300/80">
          zsh — gidit
        </div>
        <div className="space-y-1 px-4 py-4 font-mono text-xs">
          <p className="text-emerald-200/80">$ npm run dev</p>
          <p className="text-emerald-400">▶ Vite dev server ready in 843ms</p>
          <p className="text-emerald-300">▶ Electron main process reloaded</p>
          <p className="text-emerald-300">▶ Tailwind JIT watching for changes...</p>
          <p className="pt-2 text-emerald-200/70">$ git status --short</p>
          <p className="text-emerald-500">M renderer/src/components/dashboard/Desktop.tsx</p>
        </div>
      </div>
    ),
  },
  {
    id: "music",
    name: "Soundscapes",
    description: "Ambient focus playlists to match your flow.",
    icon: Music,
    accent: "text-pink-400",
    content: (
      <div className="space-y-4">
        <div className="rounded-2xl bg-gradient-to-r from-pink-500/80 via-fuchsia-500/70 to-indigo-500/80 p-6 text-white shadow-inner">
          <span className="text-xs uppercase tracking-[0.4em] text-white/70">Now playing</span>
          <h4 className="mt-3 text-xl font-semibold">Focus Nebula — Lofi Drift</h4>
          <p className="text-sm text-white/80">
            Crisp percussion, velvet pads, and gentle motion to help you glide through deep work sessions.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <Button size="icon" variant="secondary" className="rounded-full bg-white/20 text-white hover:bg-white/30">
              <PlaySquare className="h-5 w-5" />
            </Button>
            <div className="h-1.5 flex-1 rounded-full bg-white/20">
              <div className="h-full w-1/2 rounded-full bg-white/80" />
            </div>
            <span className="text-xs tracking-wide text-white/60">02:41 / 05:10</span>
          </div>
        </div>
        <div className="grid gap-2 text-xs text-white/80">
          <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">☁️ Astral Mists — dreamy synth layers</span>
          <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">🌊 Tidal Drift — oceanic binaurals</span>
          <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">🔥 Ember Echoes — warm analog textures</span>
        </div>
      </div>
    ),
  },
  {
    id: "gallery",
    name: "Gallery",
    description: "Moodboard and inspiration snapshots.",
    icon: ImageIcon,
    accent: "text-amber-300",
    content: (
      <div className="grid gap-4">
        <div className="grid grid-cols-3 gap-3">
          {["/images/aurora-1.jpg", "/images/aurora-2.jpg", "/images/aurora-3.jpg"].map((src, index) => (
            <div
              key={src}
              className={cn(
                "aspect-video rounded-xl border border-white/20 bg-gradient-to-br from-slate-100/40 via-slate-200/30 to-slate-50/20",
                index === 1 && "from-indigo-500/40 via-purple-500/30 to-pink-500/20",
                index === 2 && "from-emerald-500/40 via-teal-500/30 to-sky-500/20"
              )}
            />
          ))}
        </div>
        <p className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-xs text-slate-100/80 backdrop-blur">
          Drop your own inspirational assets here or connect this app to a Notion board, Dribbble feed, or shared team drive.
        </p>
      </div>
    ),
  },
  {
    id: "settings",
    name: "Control Center",
    description: "Theme, widgets, and productivity presets.",
    icon: SettingsIcon,
    accent: "text-violet-400",
    content: (
      <div className="space-y-4 text-sm text-slate-200">
        <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-100/70">
            Focus Mode
            <Button size="sm" variant="secondary" className="rounded-full bg-violet-500/80 text-white hover:bg-violet-500">
              Activate
            </Button>
          </div>
          <p className="mt-3 text-slate-100/80">
            Silence pings, dim the dock, and surface only the widgets that matter for deep work.
          </p>
        </div>
        <div className="grid gap-2">
          <span className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs">
            🎨 Theme: Aurora (HSL 210 / 180 accent)
          </span>
          <span className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs">
            🔔 Notifications: Gentle nudges every 45 min
          </span>
          <span className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs">
            🧠 AI Assistance: Summaries + Follow-up suggestions
          </span>
        </div>
      </div>
    ),
  },
]

const formatTime = (date: Date) =>
  date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

const formatDate = (date: Date) =>
  date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })

const getInitialPosition = (index: number) => ({
  x: 220 + index * 36,
  y: 160 + index * 28,
})

const BROWSER_MIN_WIDTH = 420
const BROWSER_MIN_HEIGHT = 360

export default function Desktop() {
  const [windows, setWindows] = useState<DesktopWindow[]>([])
  const [clock, setClock] = useState(() => new Date())
  const zIndexRef = useRef(40)

  const [resizing, setResizing] = useState<
    | null
    | {
        appId: string
        pointerId: number
        startX: number
        startY: number
        startWidth: number
        startHeight: number
      }
  >(null)

  // NEW: clean offset-based dragging (no transform jump, no mouse offset)
  const [dragging, setDragging] = useState<
    | null
    | {
        appId: string
        pointerId: number
        offsetX: number
        offsetY: number
      }
  >(null)

  // Ref to the currently dragged window DOM element
  const draggedWindowRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 60_000)
    return () => window.clearInterval(timer)
  }, [])

  // --- Resizing (unchanged styling/UX) ---
  useEffect(() => {
    if (!resizing) return

    const handleMove = (event: PointerEvent) => {
      setWindows((prev) =>
        prev.map((window) => {
          if (window.appId !== resizing.appId || !window.size) return window
          const deltaX = event.clientX - resizing.startX
          const deltaY = event.clientY - resizing.startY
          const nextWidth = Math.max(BROWSER_MIN_WIDTH, resizing.startWidth + deltaX)
          const nextHeight = Math.max(BROWSER_MIN_HEIGHT, resizing.startHeight + deltaY)
          return {
            ...window,
            size: { width: nextWidth, height: nextHeight },
          }
        })
      )
    }

    const handleUp = () => {
      setResizing(null)
    }

    window.addEventListener("pointermove", handleMove)
    window.addEventListener("pointerup", handleUp)
    window.addEventListener("pointercancel", handleUp)

    return () => {
      window.removeEventListener("pointermove", handleMove)
      window.removeEventListener("pointerup", handleUp)
      window.removeEventListener("pointercancel", handleUp)
    }
  }, [resizing])

  // --- Dragging with absolute positioning + pointer capture (no style/markup changes) ---
// --- Dragging with absolute positioning + pointer capture ---
useEffect(() => {
  if (!dragging) return

  let hasMoved = false

  const onMove = (event: PointerEvent) => {
    if (!draggedWindowRef.current) return
    const newX = event.clientX - dragging.offsetX
    const newY = event.clientY - dragging.offsetY
    draggedWindowRef.current.style.left = `${newX}px`
    draggedWindowRef.current.style.top = `${newY}px`
    hasMoved = true
  }

  const onUp = (event: PointerEvent) => {
    if (draggedWindowRef.current) {
      if (hasMoved) {
        // ✅ Only commit to React state if the window was actually moved
        const finalX = event.clientX - dragging.offsetX
        const finalY = event.clientY - dragging.offsetY
        setWindows((prev) =>
          prev.map((w) =>
            w.appId === dragging.appId
              ? { ...w, position: { x: finalX, y: finalY } }
              : w
          )
        )
      }
      try {
        draggedWindowRef.current.releasePointerCapture(dragging.pointerId)
      } catch {}
      draggedWindowRef.current = null
    }
    setDragging(null)
  }

  window.addEventListener("pointermove", onMove)
  window.addEventListener("pointerup", onUp)
  window.addEventListener("pointercancel", onUp)

  return () => {
    window.removeEventListener("pointermove", onMove)
    window.removeEventListener("pointerup", onUp)
    window.removeEventListener("pointercancel", onUp)
  }
}, [dragging])


  const timeLabel = useMemo(() => formatTime(clock), [clock])
  const dateLabel = useMemo(() => formatDate(clock), [clock])

  const getNextZIndex = useCallback(() => {
    zIndexRef.current += 1
    return zIndexRef.current
  }, [])

  const launchApp = useCallback((appId: string) => {
    setWindows((prev) => {
      const existing = prev.find((w) => w.appId === appId)
      if (existing) {
        const nextZ = getNextZIndex()
        return prev.map((w) =>
          w.appId === appId ? { ...w, minimized: false, zIndex: nextZ } : w
        )
      }

      const nextZ = getNextZIndex()
      const position = getInitialPosition(prev.length)
      const app = DESKTOP_APPS.find((item) => item.id === appId)
      const size = app && app.id === "browser" ? { width: 560, height: 520 } : undefined

      return [
        ...prev,
        {
          appId,
          minimized: false,
          maximized: false,
          position,
          size,
          zIndex: nextZ,
        },
      ]
    })
  }, [getNextZIndex])

  const toggleMinimize = useCallback((appId: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.appId === appId ? { ...w, minimized: !w.minimized } : w))
    )
  }, [])

  const toggleMaximize = useCallback((appId: string) => {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.appId !== appId) return w
        if (!w.maximized) {
          return {
            ...w,
            maximized: true,
            lastLayout: { position: w.position, size: w.size },
            position: { x: 12, y: 72 },
            size: { width: window.innerWidth - 24, height: window.innerHeight - 140 },
          }
        }
        return {
          ...w,
          maximized: false,
          position: w.lastLayout?.position ?? w.position,
          size: w.lastLayout?.size,
        }
      })
    )
  }, [])

  const closeWindow = useCallback((appId: string) => {
    setWindows((prev) => prev.filter((w) => w.appId !== appId))
  }, [])

  const focusWindow = useCallback(
    (appId: string) => {
      const nextZ = getNextZIndex()
      setWindows((prev) =>
        prev.map((w) => (w.appId === appId ? { ...w, minimized: false, zIndex: nextZ } : w))
      )
    },
    [getNextZIndex]
  )

  // Pointer down on title bar -> start drag (no styling changes)
const handleDragPointerDown = useCallback(
  (appId: string) => (event: ReactPointerEvent<HTMLDivElement>) => {
    // ✅ Prevent dragging if the click was inside a button or interactive element
    const targetEl = event.target as HTMLElement
    if (
      targetEl.closest("button") ||
      targetEl.closest("svg") ||
      targetEl.closest("input")
    ) {
      return
    }

    event.preventDefault()

    const target = windows.find((w) => w.appId === appId)
    if (!target) return

    const windowElement = event.currentTarget.parentElement as HTMLDivElement | null
    if (!windowElement) return

    const rect = windowElement.getBoundingClientRect()
    const offsetX = event.clientX - rect.left
    const offsetY = event.clientY - rect.top

    draggedWindowRef.current = windowElement
    try {
      draggedWindowRef.current.setPointerCapture(event.pointerId)
    } catch {}

    setDragging({
      appId,
      pointerId: event.pointerId,
      offsetX,
      offsetY,
    })
  },
  [windows]
)


  const handleResizePointerDown = useCallback(
    (appId: string) => (event: ReactPointerEvent<HTMLDivElement>) => {
      event.stopPropagation()
      const target = windows.find((window) => window.appId === appId)
      if (!target?.size) return

      setResizing({
        appId,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startWidth: target.size.width,
        startHeight: target.size.height,
      })
    },
    [windows]
  )

  const openWindowIds = useMemo(() => windows.map((window) => window.appId), [windows])

  return (
    <Card className="flex h-full flex-col border-0 bg-transparent shadow-none">
      {/* <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <Globe className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>Cosmos Desktop</CardTitle>
            <CardDescription>
              A skeuomorphic workspace inspired by Linux, macOS, and ChromeOS – tailor it to your flow.
            </CardDescription>
          </div>
        </div>
      </CardHeader> */}
      <CardContent className="flex min-h-0 flex-1 flex-col !p-0">
        <div className="relative flex-1 overflow-hidden border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(51,145,243,0.35),_rgba(24,35,66,0.85)_40%,_rgba(2,6,23,0.95)_80%)] text-white shadow-[0_40px_120px_-40px_rgba(15,23,42,0.8)]">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%22300%22%20height%3D%22300%22%20viewBox%3D%220%200%20300%20300%22%20fill%3D%22none%22xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%221%22%20fill%3D%22rgba(148,163,184,0.15)%22/%3E%3C/svg%3E')] opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-900/20 backdrop-blur-[2px]" />

          {/* Status bar */}
          <div className="absolute left-1/2 top-6 flex -translate-x-1/2 items-center gap-4 rounded-full bg-slate-900/60 px-6 py-2 text-xs font-medium uppercase tracking-[0.4em] text-slate-100 shadow-lg backdrop-blur">
            <span>Gidit OS</span>
            <span className="h-4 w-px bg-white/20" />
            <span>{dateLabel}</span>
            <span>{timeLabel}</span>
          </div>

          {/* <div className="absolute right-6 top-6 flex items-center gap-3 rounded-full bg-slate-900/60 px-4 py-2 text-xs text-slate-100 shadow-lg backdrop-blur">
            <Wifi className="h-4 w-4" />
            <Volume2 className="h-4 w-4" />
            <BatteryCharging className="h-4 w-4" />
          </div> */}

          {/* Windows */}
          <div className="relative h-full w-full px-4 pb-28 pt-24 sm:px-12">
            {windows.map((window, index) => {
              const app = DESKTOP_APPS.find((item) => item.id === window.appId)
              if (!app) return null

              const style: CSSProperties = {
                top: window.position.y,
                left: window.position.x,
                zIndex: window.zIndex,
                // keep your smooth settle transition after drag
                transition:
                  dragging && dragging.appId === window.appId
                    ? "none"
                    : "top 0.2s ease-out, left 0.2s ease-out",
              }
              if (window.size) {
                style.width = window.size.width
                style.height = window.size.height
              }

              const isBrowser = app.id === "browser"

              return (
                <div
                  key={`${window.appId}-${index}`}
                  onMouseDown={() => focusWindow(window.appId)}
                  style={style}
                  className={cn(
                    "absolute max-w-[90vw] overflow-hidden rounded-3xl border border-white/20 bg-white/65 text-slate-900 shadow-[0_25px_60px_-25px_rgba(15,23,42,0.7)] backdrop-blur-xl ease-out dark:bg-slate-950/80 dark:text-slate-100",
                    !window.size && "w-[360px]",
                    window.minimized && "pointer-events-none scale-95 opacity-0"
                  )}
                >
                  <div
                    className="flex items-center justify-between gap-2 border-b border-white/20 bg-white/30 px-4 py-3 text-xs uppercase tracking-[0.3em] text-slate-700 dark:bg-white/5 dark:text-slate-200"
                    onPointerDown={handleDragPointerDown(app.id)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                      <span className="flex h-2.5 w-2.5 rounded-full bg-amber-300" />
                      <span className="flex h-2.5 w-2.5 rounded-full bg-rose-400" />
                      <button
                        type="button"
                        className="ml-3 flex items-center gap-2 text-[0.7rem] font-semibold tracking-wide hover:opacity-90"
                        onClick={(e) => {
                          e.stopPropagation()
                          // Toggle the Aurora search bar inline within the app content
                          if (app.id === "browser") {
                            const searchToggle = document.createEvent("Event")
                            searchToggle.initEvent("toggle-aurora-search", true, true)
                            e.currentTarget.dispatchEvent(searchToggle)
                          }
                        }}
                        aria-label="Search"
                        title="Search"
                      >
                        <Search className={cn("h-4 w-4", app.accent)} />
                        <span className="sr-only">Search</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 rounded-full text-slate-700 transition hover:bg-slate-700/10 dark:text-slate-200"
                        onClick={(event) => {
                          event.stopPropagation()
                          toggleMaximize(app.id)
                        }}
                        aria-label="Maximize window"
                      >
                        <Maximize2 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 rounded-full text-slate-700 transition hover:bg-slate-700/10 dark:text-slate-200"
                        onClick={(event) => {
                          event.stopPropagation()
                          toggleMinimize(app.id)
                        }}
                        aria-label="Minimize window"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 rounded-full text-slate-700 transition hover:bg-slate-700/10 dark:text-slate-200"
                        onClick={(event) => {
                          event.stopPropagation()
                          closeWindow(app.id)
                        }}
                        aria-label="Close window"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex h-full flex-col bg-white/55 text-sm text-slate-700 dark:bg-slate-950/70 dark:text-slate-100">
                    <div className="flex-1 px-5 pb-6 pt-4">
                      <div className="flex h-full flex-col gap-4 overflow-hidden">
                        <div className="flex-1 overflow-auto pr-1">
                          {app.content}
                        </div>
                      </div>
                    </div>
                  </div>

                  {isBrowser && (
                    <div
                      role="presentation"
                      onPointerDown={handleResizePointerDown(app.id)}
                      className="absolute bottom-2 right-2 h-4 w-4 cursor-se-resize rounded bg-white/70 opacity-80 transition hover:bg-white"
                    />
                  )}
                </div>
              )
            })}
          </div>

          {/* Dock */}
          <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
            <div className="pointer-events-auto flex items-center gap-4 rounded-[28px] border border-white/20 bg-white/20 px-6 py-3 text-white shadow-[0_20px_60px_-25px_rgba(15,23,42,0.75)] backdrop-blur-xl">
              {DESKTOP_APPS.map((app) => {
                const isOpen = openWindowIds.includes(app.id)
                const isMinimized = windows.find((w) => w.appId === app.id)?.minimized
                return (
                  <button
                    key={`dock-${app.id}`}
                    type="button"
                    onClick={() =>
                      isOpen && !isMinimized ? toggleMinimize(app.id) : launchApp(app.id)
                    }
                    className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white transition hover:scale-105 hover:bg-white/20"
                    aria-label={isOpen ? `Focus ${app.name}` : `Open ${app.name}`}
                  >
                    <app.icon className={cn("h-5 w-5", app.accent)} />
                    <span
                      className={cn(
                        "absolute -bottom-1.5 h-1.5 w-2 rounded-full transition",
                        isOpen ? "bg-white" : "bg-transparent"
                      )}
                    />
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
