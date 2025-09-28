import { useEffect, useMemo, useState } from 'react'
import * as LucideIcons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from '@/components/ui/sidebar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Card } from '@/components/ui/card'
import { GiditLogo } from '@/components/icons/GiditLogo'
import { LayoutDashboard, LayoutTemplate, PlusCircle, Trash2, Settings, LogOut, Bot } from 'lucide-react'
import { useBuilderStore } from '@/store/builderStore'
import { WIDGETS, WIDGET_CATEGORIES, WIDGET_CATEGORY_ORDER } from './widgets'
import type { Page } from './Types'
import { AiAssistant } from '@/components/layout/AiAssistant'
import { AppSettingsDialog } from '@/components/layout/AppSettingsDialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useSettings } from '@/store/SettingsContext'

const ICON_CHOICES = [
  'LayoutDashboard',
  'KanbanSquare',
  'BarChart3',
  'PieChart',
  'Calendar',
  'FileText',
  'LineChart',
  'ListChecks',
  'NotebookPen',
  'Target',
  'TrendingUp',
  'Globe',
  'MessageSquare',
  'Users',
  'UserCog',
  'Bot',
  'Sparkles',
  'Shield',
  'ShoppingCart',
  'Briefcase',
  'WalletCards',
  'Folder',
  'ClipboardList',
  'Clock',
  'Star',
  'Lightbulb',
  'ChartColumnIncreasing',
  'Gauge',
  'Brain',
  'DollarSign',
  'Heart',
  'HeartPulse',
  'Bell',
  'Globe'
]

const getIconSizeClass = (
  size: 'sm' | 'md' | 'lg',
  variant: 'default' | 'compact' | 'large' = 'default',
) => {
  const map: Record<typeof variant, Record<typeof size, string>> = {
    default: { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-6 w-6' },
    compact: { sm: 'h-3 w-3', md: 'h-4 w-4', lg: 'h-5 w-5' },
    large: { sm: 'h-5 w-5', md: 'h-6 w-6', lg: 'h-7 w-7' },
  }
  return map[variant][size]
}

function PageNameEditor({
  page,
  onSave,
  visible,
}: {
  page: Page
  onSave: (name: string) => void
  visible: boolean
}) {
  const [value, setValue] = useState(page.name)
  const [editing, setEditing] = useState(false)
  const inputVisible = editing

  if (!visible) {
    return null
  }

  return (
    <div className="flex-1 min-w-0" onDoubleClick={() => setEditing(true)}>
      {inputVisible ? (
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onBlur={() => {
            const next = value.trim()
            if (next && next !== page.name) {
              onSave(next)
            } else {
              setValue(page.name)
            }
            setEditing(false)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              const next = value.trim()
              if (next && next !== page.name) onSave(next)
              setEditing(false)
            }
            if (event.key === 'Escape') {
              setValue(page.name)
              setEditing(false)
            }
          }}
          className="h-7 text-sm"
          autoFocus
        />
      ) : (
        <span className="truncate">{page.name}</span>
      )}
    </div>
  )
}

function PageList() {
  const { pages, activePageId, setActivePage, updatePage, deletePage, addPage, reorderPages } =
    useBuilderStore()
  const IconFallback = LayoutDashboard
  const iconMap = LucideIcons as unknown as Record<string, LucideIcon>
  const { state: sidebarState } = useSidebar()
  const isSidebarExpanded = sidebarState === 'expanded'
  const { iconSize, featureFlags } = useSettings()
  const [iconPickerPageId, setIconPickerPageId] = useState<string | null>(null)
  const [iconSearch, setIconSearch] = useState('')
  const [draggedPageId, setDraggedPageId] = useState<string | null>(null)
  const [dragOverPageId, setDragOverPageId] = useState<string | null>(null)
  const sidebarIconClass = getIconSizeClass(iconSize)
  const largeIconClass = getIconSizeClass(iconSize, 'large')
  const glassSidebar = Boolean(featureFlags.glassSidebar)
  const iconPickerOpen = iconPickerPageId !== null
  const availableIconChoices = useMemo(
    () => ICON_CHOICES.filter((iconName) => iconMap[iconName]),
    [iconMap],
  )
  const filteredIcons = useMemo(() => {
    const query = iconSearch.trim().toLowerCase()
    if (!query) return availableIconChoices
    return availableIconChoices.filter((iconName) => iconName.toLowerCase().includes(query))
  }, [iconSearch, availableIconChoices])
  const pickerPage = iconPickerPageId ? pages.find((page) => page.id === iconPickerPageId) ?? null : null

  useEffect(() => {
    if (!iconPickerOpen) {
      setIconSearch('')
    }
  }, [iconPickerOpen])

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, pageId: string) => {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', pageId)
    setDraggedPageId(pageId)
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>, pageId: string) => {
    if (!draggedPageId || draggedPageId === pageId) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setDragOverPageId(pageId)
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, pageId: string) => {
    event.preventDefault()
    if (!draggedPageId || draggedPageId === pageId) {
      handleDragEnd()
      return
    }
    const fromIndex = pages.findIndex((item) => item.id === draggedPageId)
    const toIndex = pages.findIndex((item) => item.id === pageId)
    if (fromIndex !== -1 && toIndex !== -1) {
      reorderPages(fromIndex, toIndex)
    }
    handleDragEnd()
  }

  const handleDragEnd = () => {
    setDraggedPageId(null)
    setDragOverPageId(null)
  }

  const handleDropToEnd = (event: React.DragEvent<HTMLDivElement>) => {
    if (!draggedPageId) return
    event.preventDefault()
    const fromIndex = pages.findIndex((item) => item.id === draggedPageId)
    if (fromIndex !== -1) {
      reorderPages(fromIndex, pages.length - 1)
    }
    handleDragEnd()
  }

  return (
    <>
      <SidebarMenu>
        {pages.map((page) => {
          const IconComponent = iconMap[page.icon] ?? IconFallback
          const buttonLabel = `Open ${page.name}`
          const isDragging = draggedPageId === page.id
          const isDragTarget = dragOverPageId === page.id && draggedPageId !== page.id
          return (
            <div
              key={page.id}
              draggable
              onDragStart={(event) => handleDragStart(event, page.id)}
              onDragOver={(event) => handleDragOver(event, page.id)}
              onDrop={(event) => handleDrop(event, page.id)}
              onDragEnd={handleDragEnd}
              className={cn(
                'cursor-grab active:cursor-grabbing',
                isDragTarget && 'ring-2 ring-primary/40',
                isDragging && 'opacity-70',
              )}
            >
              <SidebarMenuItem
                className={cn(
                  glassSidebar &&
                    'rounded-xl border border-white/10 bg-white/35 shadow-sm shadow-white/10 backdrop-blur-sm transition-colors dark:border-slate-800/60 dark:bg-slate-900/50',
                )}
              >
              <Tooltip disableHoverableContent={isSidebarExpanded}>
                <TooltipTrigger asChild>
                  <SidebarMenuButton
                    onClick={() => setActivePage(page.id)}
                    isActive={page.id === activePageId}
                    className={cn(
                      'h-9 justify-start gap-2',
                      'group-data-[state=collapsed]:h-11 group-data-[state=collapsed]:w-11 group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:gap-0 group-data-[state=collapsed]:p-0',
                    )}
                    aria-label={!isSidebarExpanded ? buttonLabel : undefined}
                  >
                    {isSidebarExpanded ? (
                      <span
                        role="button"
                        tabIndex={0}
                        className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-transparent bg-muted/40 text-muted-foreground transition-colors hover:border-border hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                          page.id === activePageId && 'text-foreground',
                        )}
                        onClick={(event) => {
                          event.preventDefault()
                          event.stopPropagation()
                          setIconPickerPageId(page.id)
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            event.stopPropagation()
                            setIconPickerPageId(page.id)
                          }
                        }}
                        aria-label={`Change icon for ${page.name}`}
                      >
                        <IconComponent className={sidebarIconClass} />
                      </span>
                    ) : (
                      <div
                        className={cn(
                          'flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors',
                          page.id === activePageId && 'text-foreground',
                        )}
                      >
                        <IconComponent className={sidebarIconClass} />
                      </div>
                    )}
                    <PageNameEditor
                      page={page}
                      onSave={(name) => updatePage(page.id, { name })}
                      visible={isSidebarExpanded}
                    />
                  </SidebarMenuButton>
                </TooltipTrigger>
                {!isSidebarExpanded && (
                  <TooltipContent side="right" sideOffset={8}>
                    {page.name}
                  </TooltipContent>
                )}
              </Tooltip>
              <SidebarMenuAction
                onClick={() => {
                  if (pages.length <= 1) return
                  if (window.confirm(`Delete page "${page.name}"?`)) {
                    deletePage(page.id)
                  }
                }}
                showOnHover
              >
                <Trash2 className={getIconSizeClass(iconSize, 'compact')} />
              </SidebarMenuAction>
              </SidebarMenuItem>
            </div>
          )
        })}
        <div
          onDragOver={(event) => {
            if (!draggedPageId) return
            event.preventDefault()
            event.dataTransfer.dropEffect = 'move'
            setDragOverPageId(null)
          }}
          onDrop={handleDropToEnd}
          className="h-2"
        />
        <SidebarMenuItem>
          <Tooltip disableHoverableContent={isSidebarExpanded}>
            <TooltipTrigger asChild>
              <SidebarMenuButton
                onClick={() => {
                  const name = `Page ${pages.length + 1}`
                  const id = addPage(name)
                  setActivePage(id)
                }}
                className={cn(
                  'h-9 justify-start gap-2',
                  'group-data-[state=collapsed]:h-11 group-data-[state=collapsed]:w-11 group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:gap-0 group-data-[state=collapsed]:p-0',
                )}
                aria-label={!isSidebarExpanded ? 'Add Page' : undefined}
              >
                <div
                  className={cn(
                    'flex shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors',
                    isSidebarExpanded
                      ? 'h-7 w-7 border border-transparent bg-muted/40 hover:border-border hover:text-foreground'
                      : 'h-9 w-9',
                  )}
                >
                  <PlusCircle className={sidebarIconClass} />
                </div>
                {isSidebarExpanded && <span>Add Page</span>}
              </SidebarMenuButton>
            </TooltipTrigger>
            {!isSidebarExpanded && (
              <TooltipContent side="right" sideOffset={8}>
                Add Page
              </TooltipContent>
            )}
          </Tooltip>
        </SidebarMenuItem>
      </SidebarMenu>
      <Dialog
        open={iconPickerOpen}
        onOpenChange={(open) => {
          if (!open) setIconPickerPageId(null)
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Select a page icon</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={iconSearch}
              onChange={(event) => setIconSearch(event.target.value)}
              placeholder="Search icons"
              className="h-8"
            />
            <ScrollArea className="max-h-80 pr-2">
              <div className="grid grid-cols-4 gap-2">
                {filteredIcons.map((iconName) => {
                  const Icon = iconMap[iconName] ?? IconFallback
                  const isActive = pickerPage?.icon === iconName
                  return (
                    <button
                      key={iconName}
                      type="button"
                      className={cn(
                        'flex flex-col items-center gap-1 rounded-lg border bg-background px-3 py-2 text-xs text-muted-foreground transition hover:border-primary/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                        isActive && 'border-primary text-foreground shadow-sm',
                      )}
                      onClick={() => {
                        if (!pickerPage) return
                        updatePage(pickerPage.id, { icon: iconName })
                        setIconPickerPageId(null)
                      }}
                    >
                      <Icon className={largeIconClass} />
                      <span className="truncate">{iconName}</span>
                    </button>
                  )
                })}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function WidgetCard({ widgetId }: { widgetId: string }) {
  const widget = WIDGETS[widgetId]
  const { iconSize } = useSettings()
  const compactIconClass = getIconSizeClass(iconSize, 'compact')
  return (
    <Card
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData('application/widget-id', widget.id)
        event.dataTransfer.effectAllowed = 'copy'
      }}
      className="group cursor-grab overflow-hidden border bg-background transition hover:border-primary"
    >
      <div className="flex items-center gap-2 p-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md border bg-muted text-muted-foreground">
          <LayoutDashboard className={compactIconClass} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{widget.name}</p>
          <p className="truncate text-xs text-muted-foreground">{widget.id}</p>
        </div>
      </div>
    </Card>
  )
}

function ComponentPalette() {
  const { setView, view } = useBuilderStore()
  // Palette defaults: closed (no search UI by default)
  const search = ''
  const { iconSize } = useSettings()
  const compactIconClass = getIconSizeClass(iconSize, 'compact')
  const largeIconClass = getIconSizeClass(iconSize, 'large')

  const categorized = useMemo(() => {
    const query = search.trim().toLowerCase()
    const result: Record<string, string[]> = {}
    Object.values(WIDGETS).forEach((widget) => {
      if (query) {
        const matches = widget.name.toLowerCase().includes(query) || widget.id.toLowerCase().includes(query)
        if (!matches) return
      }
      const category = widget.category || 'Productivity'
      if (!result[category]) result[category] = []
      result[category].push(widget.id)
    })
    return result
  }, [])

  const categories = useMemo(
    () =>
      WIDGET_CATEGORY_ORDER.filter((category) => {
        const items = categorized[category]
        return items && items.length > 0
      }),
    [categorized],
  )

  return (
    <div className="flex flex-1 flex-col p-2">
      {/* Search removed per request */}
      <ScrollArea className="flex-1">
        <div className="space-y-4 pr-2">
          {/* Single-open behavior: only one category at a time */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="templates">
              <AccordionTrigger className="text-sm font-semibold">
                <div className="flex items-center gap-2">
                  <LayoutTemplate className={compactIconClass} />
                  Templates
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Button
                  variant={view === 'templates' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setView('templates')}
                >
                  Open template gallery
                </Button>
              </AccordionContent>
            </AccordionItem>
            {categories.map((category) => {
              const config = WIDGET_CATEGORIES[category as keyof typeof WIDGET_CATEGORIES]
              const Icon = config?.icon ?? LayoutDashboard
              return (
                <AccordionItem key={category} value={category}>
                  <AccordionTrigger className="text-sm font-semibold">
                    <div className="flex items-center gap-2">
                      <Icon className={compactIconClass} />
                      {category}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-3">
                      {categorized[category].map((widgetId) => (
                        <WidgetCard key={widgetId} widgetId={widgetId} />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
            {!categories.length && (
              <p className="px-2 text-sm text-muted-foreground">No components match your search.</p>
            )}
          </Accordion>
        </div>
      </ScrollArea>
    </div>
  )
}

function SidebarFooterMenu({
  onOpenAssistant,
  onOpenSettings,
}: {
  onOpenAssistant: () => void
  onOpenSettings: () => void
}) {
  const { state: sidebarState } = useSidebar()
  const isSidebarExpanded = sidebarState === 'expanded'
  const { iconSize } = useSettings()
  const footerIconClass = getIconSizeClass(iconSize)

  const buttonClass = cn(
    'h-9 justify-start gap-2',
    'group-data-[state=collapsed]:h-11 group-data-[state=collapsed]:w-11 group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:gap-0 group-data-[state=collapsed]:p-0',
  )

  const iconWrapperClass = (isActive?: boolean) =>
    cn(
      'flex shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors',
      isSidebarExpanded
        ? 'h-7 w-7 border border-transparent bg-muted/40 hover:border-border hover:text-foreground'
        : 'h-9 w-9',
      isActive && 'text-foreground',
    )

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Tooltip disableHoverableContent={isSidebarExpanded}>
          <TooltipTrigger asChild>
            <SidebarMenuButton
              className={buttonClass}
              onClick={onOpenAssistant}
              aria-label={!isSidebarExpanded ? 'Assistant' : undefined}
            >
              <div className={iconWrapperClass()}>
                <Bot className={footerIconClass} />
              </div>
              {isSidebarExpanded && <span>Assistant</span>}
            </SidebarMenuButton>
          </TooltipTrigger>
          {!isSidebarExpanded && (
            <TooltipContent side="right" sideOffset={8}>
              Assistant
            </TooltipContent>
          )}
        </Tooltip>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <Tooltip disableHoverableContent={isSidebarExpanded}>
          <TooltipTrigger asChild>
            <SidebarMenuButton
              className={buttonClass}
              onClick={onOpenSettings}
              aria-label={!isSidebarExpanded ? 'Settings' : undefined}
            >
              <div className={iconWrapperClass()}>
                <Settings className={footerIconClass} />
              </div>
              {isSidebarExpanded && <span>Settings</span>}
            </SidebarMenuButton>
          </TooltipTrigger>
          {!isSidebarExpanded && (
            <TooltipContent side="right" sideOffset={8}>
              Settings
            </TooltipContent>
          )}
        </Tooltip>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <Tooltip disableHoverableContent={isSidebarExpanded}>
          <TooltipTrigger asChild>
            <SidebarMenuButton
              className={buttonClass}
              aria-label={!isSidebarExpanded ? 'Logout' : undefined}
            >
              <div className={iconWrapperClass()}>
                <LogOut className={footerIconClass} />
              </div>
              {isSidebarExpanded && <span>Logout</span>}
            </SidebarMenuButton>
          </TooltipTrigger>
          {!isSidebarExpanded && (
            <TooltipContent side="right" sideOffset={8}>
              Logout
            </TooltipContent>
          )}
        </Tooltip>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export function BuilderSidebar() {
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { view } = useBuilderStore()
  const { state: sidebarState } = useSidebar()
  const isSidebarExpanded = sidebarState === 'expanded'
  const { featureFlags } = useSettings()
  const glassSidebar = Boolean(featureFlags.glassSidebar)

  return (
    <Sidebar
      collapsible="icon"
      className={cn(
        glassSidebar &&
          'supports-[backdrop-filter]:backdrop-blur-2xl bg-white/45 text-foreground shadow-[0_25px_70px_-45px_rgba(15,23,42,0.6)] transition-colors dark:bg-slate-950/60 dark:text-slate-100',
      )}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="group/header">
            <div className="flex h-8 items-center justify-between px-2 group-data-[state=collapsed]:justify-center">
              <div className="flex items-center gap-2">
                <div className="relative flex h-8 w-8 items-center justify-center">
                  <GiditLogo className="h-6 w-6 text-primary transition-opacity group-data-[state=collapsed]:group-hover/header:opacity-0" />
                  <SidebarTrigger className="absolute inset-0 size-full group-data-[state=expanded]:hidden group-data-[state=collapsed]:opacity-0 group-data-[state=collapsed]:group-hover/header:opacity-100" />
                </div>
                <span className="font-bold text-lg text-primary group-data-[state=collapsed]:hidden">Gidit</span>
              </div>
              <SidebarTrigger className="group-data-[state=collapsed]:hidden" />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="p-0">
        <ScrollArea className="h-[calc(100vh-14rem)]">
          <div className="p-2">
            <PageList />
          </div>
          {view === 'canvas' && isSidebarExpanded ? (
            <>
              <SidebarSeparator />
              <ComponentPalette />
            </>
          ) : null}
        </ScrollArea>
        <div className="p-2">
          <SidebarFooterMenu
            onOpenAssistant={() => setAssistantOpen(true)}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        </div>
      </SidebarContent>
      <SidebarFooter />
      <AiAssistant open={assistantOpen} onOpenChange={setAssistantOpen} />
      <AppSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </Sidebar>
  )
}

export { SidebarProvider, SidebarInset }
