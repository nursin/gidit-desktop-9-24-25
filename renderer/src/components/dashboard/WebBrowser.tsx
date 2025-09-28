"use client"

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
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
  Globe,
  Image as ImageIcon,
  Music,
  RotateCw,
  Search,
  Settings as SettingsIcon,
  TerminalSquare,
} from "lucide-react"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

/* -------------------------------- Types ------------------------------- */

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

interface AuroraHandle {
  goBack: () => void
  goForward: () => void
  reload: () => void
  navigateTo: (raw: string) => void
}

/* --------------------------- Aurora Browser --------------------------- */

const AURORA_DEFAULT_URL = "https://duckduckgo.com/?q=productivity+workflow"

const normalizeUrl = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return AURORA_DEFAULT_URL
  if (/^(https?:\/\/|about:blank)/i.test(trimmed)) return trimmed
  const hasDot = trimmed.includes(".")
  const hasSpace = trimmed.includes(" ")
  const looksLikeUrl = hasDot && !hasSpace
  if (looksLikeUrl) return `https://${trimmed}`
  return `https://duckduckgo.com/?q=${encodeURIComponent(trimmed)}`
}

/**
 * AuroraBrowser is self-contained but exposes imperative controls via ref.
 * Desktop controls the title-bar UI; Aurora does the actual navigation.
 */
const AuroraBrowser = forwardRef<AuroraHandle, { onUrlChange?: (url: string) => void }>(
  function AuroraBrowser({ onUrlChange }, ref) {
    const [history, setHistory] = useState<string[]>(() => [AURORA_DEFAULT_URL])
    const [historyIndex, setHistoryIndex] = useState(0)
    const iframeRef = useRef<HTMLIFrameElement | null>(null)

    const currentUrl = history[historyIndex] ?? AURORA_DEFAULT_URL

    useEffect(() => {
      onUrlChange?.(currentUrl)
    }, [currentUrl, onUrlChange])

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
      if (iframeRef.current) iframeRef.current.src = target
    }

    const goBack = () => {
      if (historyIndex === 0) return
      const nextIndex = historyIndex - 1
      setHistoryIndex(nextIndex)
      if (iframeRef.current) iframeRef.current.src = history[nextIndex]
    }

    const goForward = () => {
      if (historyIndex >= history.length - 1) return
      const nextIndex = historyIndex + 1
      setHistoryIndex(nextIndex)
      if (iframeRef.current) iframeRef.current.src = history[nextIndex]
    }

    const reload = () => {
      if (!iframeRef.current) return
      const url = history[historyIndex]
      iframeRef.current.src = "about:blank"
      window.setTimeout(() => {
        if (iframeRef.current) iframeRef.current.src = url
      }, 40)
    }

    useImperativeHandle(ref, () => ({
      goBack,
      goForward,
      reload,
      navigateTo,
    }))

    return (
      <div className="flex min-h-full flex-col text-slate-200">
        {/* No toolbar here; toolbar is in Desktop title bar */}
        <div className="flex-1 overflow-hidden bg-slate-950/40">
          <iframe
            ref={iframeRef}
            src={currentUrl}
            title="Aurora Browser"
            sandbox="allow-forms allow-popups allow-scripts allow-same-origin"
            className="h-full w-full bg-white/5"
          />
        </div>
      </div>
    )
  }
)

/* ------------------------- Desktop / Windowing ------------------------ */

const DESKTOP_APPS_BASE: Omit<DesktopApp, "content">[] = [
  {
    id: "browser",
    name: "Aurora Browser",
    description: "",
    icon: Globe,
    accent: "text-sky-400",
  },
  {
    id: "terminal",
    name: "Nebula Terminal",
    description: "Run quick commands without leaving focus mode.",
    icon: TerminalSquare,
    accent: "text-emerald-400",
  },
  {
    id: "music",
    name: "Soundscapes",
    description: "Ambient focus playlists to match your flow.",
    icon: Music,
    accent: "text-pink-400",
  },
  {
    id: "gallery",
    name: "Gallery",
    description: "Moodboard and inspiration snapshots.",
    icon: ImageIcon,
    accent: "text-amber-300",
  },
  {
    id: "settings",
    name: "Control Center",
    description: "Theme, widgets, and productivity presets.",
    icon: SettingsIcon,
    accent: "text-violet-400",
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

const MAXIMIZED_MARGIN_X = 100
const MAXIMIZED_MARGIN_Y = 140
const WINDOW_MIN_WIDTH = 420
const WINDOW_MIN_HEIGHT = 360

export default function Desktop() {
  const [windows, setWindows] = useState<DesktopWindow[]>([])
  const [clock, setClock] = useState(() => new Date())
  const zIndexRef = useRef(40)

  // Aurora integration (title-bar input lives here)
  const auroraRef = useRef<AuroraHandle | null>(null)
  const [browserInput, setBrowserInput] = useState<string>("")
  const [showBrowserSearch, setShowBrowserSearch] = useState(false)

  const [dragging, setDragging] = useState<null | {
    appId: string
    pointerId: number
    offsetX: number
    offsetY: number
  }>(null)

  const draggedWindowRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 60_000)
    return () => window.clearInterval(timer)
  }, [])

  // Drag handling
  useEffect(() => {
    if (!dragging) return
    let hasMoved = false

    const onMove = (e: PointerEvent) => {
      if (!draggedWindowRef.current) return
      const newX = e.clientX - dragging.offsetX
      const newY = e.clientY - dragging.offsetY
      draggedWindowRef.current.style.left = `${newX}px`
      draggedWindowRef.current.style.top = `${newY}px`
      hasMoved = true
    }

    const onUp = (e: PointerEvent) => {
      if (draggedWindowRef.current && hasMoved) {
        const finalX = e.clientX - dragging.offsetX
        const finalY = e.clientY - dragging.offsetY
        setWindows((prev) =>
          prev.map((w) =>
            w.appId === dragging.appId ? { ...w, position: { x: finalX, y: finalY } } : w
          )
        )
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

  const getNextZIndex = useCallback(() => {
    zIndexRef.current += 1
    return zIndexRef.current
  }, [])

  const launchApp = useCallback(
    (appId: string) => {
      setWindows((prev) => {
        const existing = prev.find((w) => w.appId === appId)
        if (existing) {
          return prev.map((w) =>
            w.appId === appId
              ? { ...w, minimized: false, zIndex: getNextZIndex() }
              : w
          )
        }
        const position = getInitialPosition(prev.length)
        const size = appId === "browser" ? { width: 560, height: 520 } : undefined
        return [
          ...prev,
          {
            appId,
            minimized: false,
            maximized: false,
            position,
            size,
            zIndex: getNextZIndex(),
          },
        ]
      })
    },
    [getNextZIndex]
  )

  const toggleMinimize = useCallback((appId: string) => {
    setWindows((prev) =>
      prev.map((w) =>
        w.appId === appId ? { ...w, minimized: !w.minimized } : w
      )
    )
  }, [])

  const toggleMaximize = useCallback((appId: string) => {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.appId !== appId) return w

        if (w.maximized) {
          return {
            ...w,
            maximized: false,
            position: w.lastLayout?.position ?? w.position,
            size: w.lastLayout?.size ?? w.size,
          }
        }

        const viewportWidth =
          typeof window !== "undefined"
            ? Math.max(WINDOW_MIN_WIDTH, window.innerWidth - MAXIMIZED_MARGIN_X)
            : w.size?.width ?? WINDOW_MIN_WIDTH
        const viewportHeight =
          typeof window !== "undefined"
            ? Math.max(WINDOW_MIN_HEIGHT, window.innerHeight - MAXIMIZED_MARGIN_Y)
            : w.size?.height ?? WINDOW_MIN_HEIGHT

        return {
          ...w,
          maximized: true,
          lastLayout: {
            position: w.position,
            size: w.size,
          },
          position: { x: 40, y: 40 },
          size: {
            width: viewportWidth,
            height: viewportHeight,
          },
        }
      })
    )
  }, [])

  const handleDragPointerDown = useCallback(
    (appId: string) => (event: ReactPointerEvent<HTMLDivElement>) => {
      const targetEl = event.target as HTMLElement
      if (
        targetEl.closest("button") ||
        targetEl.closest("svg") ||
        targetEl.closest("input") ||
        targetEl.closest("span")
      ) {
        return
      }

      event.preventDefault()

      const windowElement = event.currentTarget.closest(
        "div[role='window']"
      ) as HTMLDivElement | null
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
    []
  )

  const timeLabel = useMemo(() => formatTime(clock), [clock])
  const dateLabel = useMemo(() => formatDate(clock), [clock])
  const openWindowIds = useMemo(() => windows.map((w) => w.appId), [windows])

  // Build DESKTOP_APPS with content (Aurora needs a ref + callback)
  const DESKTOP_APPS: DesktopApp[] = useMemo(() => {
    return DESKTOP_APPS_BASE.map((base) => {
      if (base.id === "browser") {
        return {
          ...base,
          content: (
            <AuroraBrowser
              ref={auroraRef}
              onUrlChange={(url) => setBrowserInput(url)}
            />
          ),
        }
      }
      if (base.id === "terminal") {
        return {
          ...base,
          content: <div className="p-4 text-emerald-300">$ npm run dev</div>,
        }
      }
      if (base.id === "music") {
        return {
          ...base,
          content: <div className="p-4 text-pink-200">Music Player</div>,
        }
      }
      if (base.id === "gallery") {
        return {
          ...base,
          content: <div className="p-4 text-amber-200">Gallery Content</div>,
        }
      }
      if (base.id === "settings") {
        return {
          ...base,
          content: <div className="p-4 text-violet-200">Settings</div>,
        }
      }
      return { ...base, content: null }
    })
  }, [])

  const handleBrowserKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && browserInput.trim()) {
      auroraRef.current?.navigateTo(browserInput)
    }
  }

  return (
    <Card className="flex h-full flex-col border-0 bg-transparent shadow-none">
      <CardContent className="flex min-h-0 flex-1 flex-col !p-0">
        <div className="relative flex-1 overflow-hidden border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(51,145,243,0.35),_rgba(24,35,66,0.85)_40%,_rgba(2,6,23,0.95)_80%)] text-white">
          {/* Status bar */}
          <div className="absolute left-1/2 top-6 flex -translate-x-1/2 items-center gap-4 rounded-full bg-slate-900/60 px-6 py-2 text-xs font-medium uppercase tracking-[0.4em] text-slate-100 shadow-lg backdrop-blur">
            <span>Gidit OS</span>
            <span className="h-4 w-px bg-white/20" />
            <span>{dateLabel}</span>
            <span>{timeLabel}</span>
          </div>

          {/* Windows */}
          <div className="relative h-full w-full px-4 pb-28 pt-24 sm:px-12">
            {windows.map((window, index) => {
              const app = DESKTOP_APPS.find((item) => item.id === window.appId)
              if (!app) return null

              const style: CSSProperties = {
                top: window.position.y,
                left: window.position.x,
                zIndex: window.zIndex,
              }
              if (window.size) {
                style.width = window.size.width
                style.height = window.size.height
              }

              const isBrowser = app.id === "browser"

              return (
                <div
                  key={`${window.appId}-${index}`}
                  role="window"
                  style={style}
                  className={cn(
                    "absolute max-w:[90vw] overflow-hidden rounded-3xl border border-white/20 bg-white/65 text-slate-900 backdrop-blur-xl ease-out dark:bg-slate-950/80 dark:text-slate-100",
                    !window.size && "w-[360px]",
                    window.minimized && "pointer-events-none scale-95 opacity-0"
                  )}
                >
                  {/* Title bar */}
                  <div
                    className="flex items-center justify-between gap-3 border-b border-white/20 bg-white/30 px-4 py-3 text-xs uppercase tracking-[0.3em] dark:bg-white/5"
                    onPointerDown={handleDragPointerDown(app.id)}
                  >
                    <div className="flex flex-1 items-center gap-2 min-w-0">
                      {isBrowser && (
                        <div className="flex flex-1 items-center gap-2 min-w-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0 text-slate-200"
                            onClick={(event) => {
                              event.stopPropagation()
                              auroraRef.current?.goBack()
                            }}
                          >
                            <ArrowLeft className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0 text-slate-200"
                            onClick={(event) => {
                              event.stopPropagation()
                              auroraRef.current?.goForward()
                            }}
                          >
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0 text-slate-200"
                            onClick={(event) => {
                              event.stopPropagation()
                              auroraRef.current?.reload()
                            }}
                          >
                            <RotateCw className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "h-7 w-7 shrink-0 text-slate-200",
                              showBrowserSearch && "bg-white/15"
                            )}
                            onClick={(event) => {
                              event.stopPropagation()
                              setShowBrowserSearch((v) => !v)
                              setTimeout(() => {
                                const el = document.getElementById("aurora-toolbar-input")
                                el?.focus()
                                ;(el as HTMLInputElement | null)?.select?.()
                              }, 0)
                            }}
                          >
                            <Search className="h-4 w-4" />
                          </Button>

                          {showBrowserSearch && (
                            <Input
                              id="aurora-toolbar-input"
                              value={browserInput}
                              onChange={(event) => setBrowserInput(event.target.value)}
                              onKeyDown={handleBrowserKeyDown}
                              placeholder="Search or URL"
                              className="h-7 flex-1 min-w-0 rounded-md border border-white/20 bg-slate-800/70 px-2 text-xs text-white placeholder:text-white/40"
                              onClick={(event) => event.stopPropagation()}
                            />
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className="flex h-2.5 w-2.5 cursor-pointer rounded-full bg-rose-400"
                        onClick={(event) => {
                          event.stopPropagation()
                          setWindows((prev) => prev.filter((w) => w.appId !== app.id))
                        }}
                        aria-label="Close window"
                      />
                      <span
                        className="flex h-2.5 w-2.5 cursor-pointer rounded-full bg-amber-300"
                        onClick={(event) => {
                          event.stopPropagation()
                          toggleMinimize(app.id)
                        }}
                        aria-label="Toggle minimize"
                      />
                      <span
                        className="flex h-2.5 w-2.5 cursor-pointer rounded-full bg-emerald-400"
                        onClick={(event) => {
                          event.stopPropagation()
                          toggleMaximize(app.id)
                        }}
                        aria-label="Toggle maximize"
                      />
                    </div>
                  </div>

                  {/* Window content */}
                  <div className="flex h-full flex-col bg-white/55 text-sm text-slate-700 dark:bg-slate-950/70 dark:text-slate-100">
                    <div className="flex-1 overflow-auto px-5 pb-6 pt-4">
                      {app.content}
                    </div>
                  </div>
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
                    onClick={(e) => {
                      e.stopPropagation(),
                      isOpen && !isMinimized ? toggleMinimize(app.id) : launchApp(app.id)
                    }}
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
