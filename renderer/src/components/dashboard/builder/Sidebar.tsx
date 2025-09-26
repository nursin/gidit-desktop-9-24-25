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
  'Bell'
]

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
  const { pages, activePageId, setActivePage, updatePage, deletePage, addPage } = useBuilderStore()
  const IconFallback = LayoutDashboard
  const iconMap = LucideIcons as unknown as Record<string, LucideIcon>
  const { state: sidebarState } = useSidebar()
  const isSidebarExpanded = sidebarState === 'expanded'
  const [iconPickerPageId, setIconPickerPageId] = useState<string | null>(null)
  const [iconSearch, setIconSearch] = useState('')
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

  return (
    <>
      <SidebarMenu>
        {pages.map((page) => {
          const IconComponent = iconMap[page.icon] ?? IconFallback
          const buttonLabel = `Open ${page.name}`
          return (
            <SidebarMenuItem key={page.id}>
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
                      <button
                        type="button"
                        className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-transparent bg-muted/40 text-muted-foreground transition-colors hover:border-border hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                          page.id === activePageId && 'text-foreground',
                        )}
                        onClick={(event) => {
                          event.preventDefault()
                          event.stopPropagation()
                          setIconPickerPageId(page.id)
                        }}
                        aria-label={`Change icon for ${page.name}`}
                      >
                        <IconComponent className="h-5 w-5" />
                      </button>
                    ) : (
                      <div
                        className={cn(
                          'flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors',
                          page.id === activePageId && 'text-foreground',
                        )}
                      >
                        <IconComponent className="h-5 w-5" />
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
                <Trash2 className="h-4 w-4" />
              </SidebarMenuAction>
            </SidebarMenuItem>
          )
        })}
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
                  <PlusCircle className="h-5 w-5" />
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
                      <Icon className="h-6 w-6" />
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
          <LayoutDashboard className="h-4 w-4" />
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
  const [search, setSearch] = useState('')

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
  }, [search])

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
      <div className="mb-3">
        <Input placeholder="Search components" value={search} onChange={(event) => setSearch(event.target.value)} className="h-8" />
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-4 pr-2">
          <Accordion type="multiple" defaultValue={categories} className="w-full">
            <AccordionItem value="templates">
              <AccordionTrigger className="text-sm font-semibold">
                <div className="flex items-center gap-2">
                  <LayoutTemplate className="h-4 w-4" />
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
                      <Icon className="h-4 w-4" />
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
                <Bot className="h-5 w-5" />
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
                <Settings className="h-5 w-5" />
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
                <LogOut className="h-5 w-5" />
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

  return (
    <Sidebar collapsible="icon">
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
