"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import type { LucideIcon } from "lucide-react"
import {
  ArrowLeft,
  ArrowRight,
  BatteryCharging,
  Globe,
  Image as ImageIcon,
  Minus,
  Music,
  PlaySquare,
  Plus,
  RotateCw,
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
  position: { x: number; y: number }
  zIndex: number
}

const DESKTOP_APPS: DesktopApp[] = [
  {
    id: "browser",
    name: "Aurora Browser",
    description: "Pinned documentation, quick links, and snippets.",
    icon: Globe,
    accent: "text-sky-400",
    content: (
      <div className="space-y-4">
        <div className="rounded-xl border border-white/20 bg-slate-900/80 text-slate-200">
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-300">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            session.web
          </div>
          <div className="space-y-3 px-4 py-4 text-sm leading-relaxed">
            <p>
              This is a placeholder browser window. Wire it up to the actual Web Browser widget or an embedded page to turn your desktop into a launchpad for research and quick triage.
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-emerald-200">
                git status
              </span>
              <span className="rounded-full border border-sky-400/40 bg-sky-400/10 px-3 py-1 text-sky-200">
                roadmap.md
              </span>
              <span className="rounded-full border border-violet-400/40 bg-violet-400/10 px-3 py-1 text-violet-200">
                user interviews
              </span>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-xs text-white/80 backdrop-blur">
          Tip: Drag this window and the dock into focus before handing the experience over to your users.
        </div>
      </div>
    ),
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

export default function Desktop() {
  const [windows, setWindows] = useState<DesktopWindow[]>([])
  const [clock, setClock] = useState(() => new Date())
  const zIndexRef = useRef(40)

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 60_000)
    return () => window.clearInterval(timer)
  }, [])

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

      return [
        ...prev,
        {
          appId,
          minimized: false,
          position,
          zIndex: nextZ,
        },
      ]
    })
  }, [getNextZIndex])

  const toggleMinimize = useCallback((appId: string) => {
    setWindows((prev) =>
      prev.map((w) =>
        w.appId === appId ? { ...w, minimized: !w.minimized } : w
      )
    )
  }, [])

  const closeWindow = useCallback((appId: string) => {
    setWindows((prev) => prev.filter((w) => w.appId !== appId))
  }, [])

  const focusWindow = useCallback(
    (appId: string) => {
      const nextZ = getNextZIndex()
      setWindows((prev) =>
        prev.map((w) =>
          w.appId === appId ? { ...w, minimized: false, zIndex: nextZ } : w
        )
      )
    },
    [getNextZIndex]
  )

  const openWindowIds = useMemo(
    () => windows.map((window) => window.appId),
    [windows]
  )

  return (
    <Card className="flex h-full flex-col border-0 bg-transparent shadow-none">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <Globe className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>Cosmos Desktop</CardTitle>
            <CardDescription>
              A skeuomorphic workspace inspired by Linux, macOS, and ChromeOS – tailor it to your flow.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col">
        <div className="relative flex-1 overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(51,145,243,0.35),_rgba(24,35,66,0.85)_40%,_rgba(2,6,23,0.95)_80%)] text-white shadow-[0_40px_120px_-40px_rgba(15,23,42,0.8)]">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%22300%22%20height%3D%22300%22%20viewBox%3D%220%200%20300%20300%22%20fill%3D%22none%22xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%221%22%20fill%3D%22rgba(148,163,184,0.15)%22/%3E%3C/svg%3E')] opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-900/20 backdrop-blur-[2px]" />

          {/* Status bar */}
          <div className="absolute left-1/2 top-6 flex -translate-x-1/2 items-center gap-4 rounded-full bg-slate-900/60 px-6 py-2 text-xs font-medium uppercase tracking-[0.4em] text-slate-100 shadow-lg backdrop-blur">
            <span>Gidit OS</span>
            <span className="h-4 w-px bg-white/20" />
            <span>{dateLabel}</span>
            <span>{timeLabel}</span>
          </div>

          <div className="absolute right-6 top-6 flex items-center gap-3 rounded-full bg-slate-900/60 px-4 py-2 text-xs text-slate-100 shadow-lg backdrop-blur">
            <Wifi className="h-4 w-4" />
            <Volume2 className="h-4 w-4" />
            <BatteryCharging className="h-4 w-4" />
          </div>

          {/* Desktop icons */}
          <div className="pointer-events-none absolute inset-0">
            <div className="pointer-events-auto grid gap-5 px-10 py-20 sm:w-52">
              {DESKTOP_APPS.map((app) => (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => launchApp(app.id)}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/80 transition hover:border-white/30 hover:bg-white/10"
                >
                  <span className={cn("grid h-12 w-12 place-content-center rounded-xl bg-white/10", app.accent)}>
                    <app.icon className="h-5 w-5" />
                  </span>
                  <span className="w-full truncate text-center">{app.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Windows */}
          <div className="relative h-full w-full px-4 pb-28 pt-24 sm:px-12">
            {windows.map((window, index) => {
              const app = DESKTOP_APPS.find((item) => item.id === window.appId)
              if (!app) return null

              return (
                <div
                  key={`${window.appId}-${index}`}
                  onMouseDown={() => focusWindow(window.appId)}
                  style={{
                    top: window.position.y,
                    left: window.position.x,
                    zIndex: window.zIndex,
                  }}
                  className={cn(
                    "absolute w-[360px] max-w-[90vw] overflow-hidden rounded-3xl border border-white/20 bg-white/65 text-slate-900 shadow-[0_25px_60px_-25px_rgba(15,23,42,0.7)] backdrop-blur-xl transition-all duration-200 ease-out dark:bg-slate-950/80 dark:text-slate-100",
                    window.minimized && "pointer-events-none scale-95 opacity-0"
                  )}
                >
                  <div className="flex items-center justify-between gap-2 border-b border-white/20 bg-white/30 px-4 py-3 text-xs uppercase tracking-[0.3em] text-slate-700 dark:bg-white/5 dark:text-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                      <span className="flex h-2.5 w-2.5 rounded-full bg-amber-300" />
                      <span className="flex h-2.5 w-2.5 rounded-full bg-rose-400" />
                      <span className="ml-3 flex items-center gap-2 text-[0.7rem] font-semibold tracking-wide">
                        <app.icon className={cn("h-4 w-4", app.accent)} />
                        {app.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
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
                  <div className="space-y-4 bg-white/55 p-5 text-sm text-slate-700 dark:bg-slate-950/70 dark:text-slate-100">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500/70 dark:text-slate-300/50">
                      {app.description}
                    </p>
                    {app.content}
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
                    onClick={() => (isOpen && !isMinimized ? toggleMinimize(app.id) : launchApp(app.id))}
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

          {/* Quick launch strip */}
          <div className="absolute bottom-6 right-6 hidden flex-col gap-3 text-xs text-white/80 lg:flex">
            <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur">
              <p className="uppercase tracking-[0.4em] text-white/60">Focus preset</p>
              <p className="mt-1 font-semibold">Deep Work • 90 min</p>
              <p className="text-white/60">Dark theme · AI summaries · Ambient Nebula</p>
            </div>
            <div className="grid gap-2">
              <Button
                variant="ghost"
                className="justify-start gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Switch Workspace
              </Button>
              <Button
                variant="ghost"
                className="justify-start gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-white"
              >
                <ArrowRight className="h-4 w-4" />
                Jump to Builder
              </Button>
              <Button
                variant="ghost"
                className="justify-start gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-white"
              >
                <RotateCw className="h-4 w-4" />
                Refresh Widgets
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
