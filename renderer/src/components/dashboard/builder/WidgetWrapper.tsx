import type { HTMLAttributes } from 'react'
import { ArrowDown, ArrowUp, Copy, GripVertical, Minus, Plus, Settings, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { Item } from './Types'
import { WIDGETS } from './widgets'

const FONT_OPTIONS = [
  { value: 'font-inter', label: 'Inter' },
  { value: 'font-roboto', label: 'Roboto' },
  { value: 'font-lato', label: 'Lato' },
  { value: 'font-montserrat', label: 'Montserrat' },
]

const SIZE_OPTIONS = [1, 2, 3, 4] as const

interface WidgetWrapperProps
  extends HTMLAttributes<HTMLDivElement>,
    Pick<Item, 'id' | 'name' | 'width' | 'height'> {
  widgetId: string
  onRemove: (id: string) => void
  onSizeChange: (id: string, size: { width: number; height: number }) => void
  onNameChange: (id: string, name: string) => void
  onPropChange: (id: string, props: Record<string, unknown>) => void
  onDuplicate?: (id: string) => void
  onMove?: (id: string, direction: 'up' | 'down') => void
  isOverlay?: boolean
  font?: string
  theme?: 'light' | 'dark' | 'custom'
  customBackgroundColor?: string
  customTextColor?: string
  orientation?: string
  children: React.ReactNode
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
  onDuplicate,
  onMove,
  ...rest
}: WidgetWrapperProps) {
  const widget = WIDGETS[widgetId]
  const displayName = name ?? widget?.name ?? 'Widget'

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

  return (
    <div
      className={cn(
        'group relative h-full w-full overflow-hidden rounded-lg border shadow-sm',
        themeClasses[theme],
        font,
        isOverlay && theme === 'light' && 'bg-card',
        className,
      )}
      style={themeStyle}
      {...rest}
    >
      {!isOverlay && (
        <div className="absolute right-1 top-1 z-20 flex items-center gap-1 rounded-md bg-card/70 px-1 py-0.5 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Widget settings">
                <Settings className="h-4 w-4" />
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
          >
            <GripVertical className="h-4 w-4" />
          </Button>
          {onDuplicate && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onDuplicate(id)}
              aria-label="Duplicate widget"
            >
              <Copy className="h-4 w-4" />
            </Button>
          )}
          {onMove && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onMove(id, 'up')}
                aria-label="Move widget up"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onMove(id, 'down')}
                aria-label="Move widget down"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onRemove(id)}
            aria-label="Remove widget"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="flex h-full w-full flex-col overflow-hidden bg-transparent">
        {children}
      </div>
    </div>
  )
}
