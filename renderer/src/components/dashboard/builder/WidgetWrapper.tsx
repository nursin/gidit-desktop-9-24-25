import type { DragEvent, HTMLAttributes } from 'react'
import { GripVertical, Minus, Plus, Settings, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { Item } from './Types'
import { WIDGETS } from './widgets'
import { useSettings } from '@/store/SettingsContext'

const FONT_OPTIONS = [
  { value: 'font-inter', label: 'Inter' },
  { value: 'font-roboto', label: 'Roboto' },
  { value: 'font-lato', label: 'Lato' },
  { value: 'font-montserrat', label: 'Montserrat' },
]

interface WidgetWrapperProps
  extends HTMLAttributes<HTMLDivElement>,
    Pick<Item, 'id' | 'name' | 'width' | 'height'> {
  widgetId: string
  onRemove: (id: string) => void
  onSizeChange: (id: string, size: { width: number; height: number }) => void
  onNameChange: (id: string, name: string) => void
  onPropChange: (id: string, props: Record<string, unknown>) => void
  isOverlay?: boolean
  font?: string
  theme?: 'light' | 'dark' | 'custom'
  customBackgroundColor?: string
  customTextColor?: string
  orientation?: string
  children: React.ReactNode
  onDragStartHandle?: (event: DragEvent<HTMLButtonElement>) => void
  onDragEndHandle?: () => void
  onDragEnterContainer?: (event: DragEvent<HTMLDivElement>) => void
  onDragOverContainer?: (event: DragEvent<HTMLDivElement>) => void
  onDropContainer?: (event: DragEvent<HTMLDivElement>) => void
  isDragTarget?: boolean
  isDragging?: boolean
}

const themeClasses = {
  light: 'bg-card text-card-foreground',
  dark: 'dark bg-card text-card-foreground',
  custom: '',
}

export function WidgetWrapper({
  children,
  id,
  widgetId,
  name,
  width,
  height,
  onRemove,
  onSizeChange,
  onNameChange,
  onPropChange,
  isOverlay = false,
  font = 'font-inter',
  theme = 'light',
  customBackgroundColor,
  customTextColor,
  orientation,
  className,
  style,
  onDragStartHandle,
  onDragEndHandle,
  onDragEnterContainer,
  onDragOverContainer,
  onDropContainer,
  isDragTarget = false,
  isDragging = false,
  ...rest
}: WidgetWrapperProps) {
  const widget = WIDGETS[widgetId]
  const displayName = name ?? widget?.name ?? 'Widget'
  const { featureFlags } = useSettings()
  const glassWidgets = Boolean(featureFlags.glassWidgets)

  const renderCustomSettings = () => {
    if (widgetId !== 'NavigationBar') return null
    return (
      <div className="grid grid-cols-3 items-center gap-4">
        <Label htmlFor={`orientation-${id}`}>Orientation</Label>
        <div className="col-span-2">
          <Select
            defaultValue={orientation ?? 'horizontal'}
            onValueChange={(value) => onPropChange(id, { orientation: value })}
          >
            <SelectTrigger id={`orientation-${id}`} className="h-8">
              <SelectValue placeholder="Select orientation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="horizontal">Horizontal</SelectItem>
              <SelectItem value="vertical">Vertical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    )
  }

  const themeStyle: React.CSSProperties =
    theme === 'custom'
      ? {
          backgroundColor: customBackgroundColor,
          color: customTextColor,
        }
      : {}

  const combinedStyle = {
    ...style,
    ...themeStyle,
  }

  return (
    <div
      className={cn(
        'group relative h-full w-full overflow-hidden shadow-sm',
        themeClasses[theme],
        font,
        isOverlay && theme === 'light' && 'bg-card',
        glassWidgets &&
          'bg-white/30 text-slate-800 shadow-[0_25px_60px_-45px_rgba(15,23,42,0.45)] supports-[backdrop-filter]:backdrop-blur-xl transition-colors dark:bg-slate-900/40 dark:text-slate-100',
        isDragTarget && 'ring-2 ring-primary/40',
        isDragging && 'opacity-70',
        className,
      )}
      style={combinedStyle}
      onDragEnter={(event) => {
        onDragEnterContainer?.(event)
      }}
      onDragOver={(event) => {
        onDragOverContainer?.(event)
      }}
      onDrop={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onDropContainer?.(event)
      }}
      {...rest}
    >
      {!isOverlay && (
        <div className="absolute right-1 top-1 z-20 flex items-center gap-1 rounded-md bg-card/70 px-1 py-0.5 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Widget settings">
                <Settings className="h-[var(--app-icon-size,1.25rem)] w-[var(--app-icon-size,1.25rem)]" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Widget settings</h4>
                <p className="text-xs text-muted-foreground">Customize this widget.</p>
              </div>
              <div className="grid gap-4">
                {renderCustomSettings()}
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor={`name-${id}`}>Name</Label>
                  <Input
                    id={`name-${id}`}
                    defaultValue={displayName}
                    onChange={(event) => onNameChange(id, event.target.value)}
                    className="col-span-2 h-8"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label>Width</Label>
                  <div className="col-span-2 flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-6 w-6"
                      onClick={() => onSizeChange(id, { width: Math.max(1, width - 1), height })}
                      aria-label="Decrease width"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm">{width}</span>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-6 w-6"
                      onClick={() => onSizeChange(id, { width: Math.min(4, width + 1), height })}
                      aria-label="Increase width"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label>Height</Label>
                  <div className="col-span-2 flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-6 w-6"
                      onClick={() => onSizeChange(id, { width, height: Math.max(1, height - 1) })}
                      aria-label="Decrease height"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm">{height}</span>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-6 w-6"
                      onClick={() => onSizeChange(id, { width, height: Math.min(8, height + 1) })}
                      aria-label="Increase height"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label>Theme</Label>
                  <RadioGroup
                    defaultValue={theme}
                    onValueChange={(value) => onPropChange(id, { theme: value })}
                    className="col-span-2 flex items-center gap-3"
                  >
                    <div className="flex items-center space-x-1 text-xs">
                      <RadioGroupItem value="light" id={`theme-light-${id}`} />
                      <Label htmlFor={`theme-light-${id}`}>Light</Label>
                    </div>
                    <div className="flex items-center space-x-1 text-xs">
                      <RadioGroupItem value="dark" id={`theme-dark-${id}`} />
                      <Label htmlFor={`theme-dark-${id}`}>Dark</Label>
                    </div>
                    <div className="flex items-center space-x-1 text-xs">
                      <RadioGroupItem value="custom" id={`theme-custom-${id}`} />
                      <Label htmlFor={`theme-custom-${id}`}>Custom</Label>
                    </div>
                  </RadioGroup>
                </div>
                {theme === 'custom' && (
                  <>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor={`bg-${id}`}>BG Color</Label>
                      <Input
                        id={`bg-${id}`}
                        type="color"
                        defaultValue={customBackgroundColor ?? '#ffffff'}
                        onChange={(event) => onPropChange(id, { customBackgroundColor: event.target.value })}
                        className="col-span-2 h-8 p-1"
                      />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor={`text-${id}`}>Text Color</Label>
                      <Input
                        id={`text-${id}`}
                        type="color"
                        defaultValue={customTextColor ?? '#000000'}
                        onChange={(event) => onPropChange(id, { customTextColor: event.target.value })}
                        className="col-span-2 h-8 p-1"
                      />
                    </div>
                  </>
                )}
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label>Font</Label>
                  <div className="col-span-2">
                    <Select defaultValue={font} onValueChange={(value) => onPropChange(id, { font: value })}>
                      <SelectTrigger id={`font-${id}`} className="h-8">
                        <SelectValue placeholder="Select font" />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 cursor-grab"
            aria-label="Drag widget"
            draggable={Boolean(onDragStartHandle)}
            onDragStart={(event) => onDragStartHandle?.(event)}
            onDragEnd={() => onDragEndHandle?.()}
          >
            <GripVertical className="h-[var(--app-icon-size,1.25rem)] w-[var(--app-icon-size,1.25rem)]" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
          onClick={() => onRemove(id)}
          aria-label="Remove widget"
        >
          <X className="h-[var(--app-icon-size,1.25rem)] w-[var(--app-icon-size,1.25rem)]" />
          </Button>
        </div>
      )}

      <div className="flex h-full w-full flex-col overflow-hidden bg-transparent">
        {children}
      </div>
    </div>
  )
}
