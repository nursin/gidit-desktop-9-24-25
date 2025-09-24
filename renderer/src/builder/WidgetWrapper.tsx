import React from 'react'
import { ArrowDown, ArrowUp, Copy, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { WIDGETS } from './widgets'

type Props = {
  children: React.ReactNode
  id: string
  widgetId: string
  name?: string
  width: number
  height: number
  onRemove: (id: string) => void
  onSizeChange: (id: string, size: { width: number; height: number }) => void
  onNameChange: (id: string, name: string) => void
  onPropChange: (id: string, props: Record<string, unknown>) => void
  onDuplicate?: (id: string) => void
  onMove?: (id: string, direction: 'up' | 'down') => void
  theme?: 'light' | 'dark' | 'custom'
  customBackgroundColor?: string
  customTextColor?: string
} & React.HTMLAttributes<HTMLDivElement>

const SIZE_OPTIONS = [1, 2, 3, 4] as const

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
  onDuplicate,
  onMove,
  theme = 'light',
  customBackgroundColor,
  customTextColor,
  className,
  ...rest
}: Props) {
  const widget = WIDGETS[widgetId]
  const displayName = name || widget?.name || 'Widget'

  const background = (() => {
    if (theme === 'dark') return '#111827'
    if (theme === 'custom' && customBackgroundColor) return customBackgroundColor
    return '#ffffff'
  })()

  const foreground = (() => {
    if (theme === 'dark') return '#f9fafb'
    if (theme === 'custom' && customTextColor) return customTextColor
    return '#0f172a'
  })()

  return (
    <Card className={cn('flex h-full w-full flex-col overflow-hidden', className)} {...rest}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg font-semibold leading-none tracking-tight">
            {displayName}
          </CardTitle>
          <p className="text-xs text-muted-foreground">{widgetId}</p>
        </div>
        <div className="flex items-center gap-1">
          {onMove && (
            <>
              <Button size="icon" variant="ghost" onClick={() => onMove(id, 'up')} title="Move up">
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => onMove(id, 'down')} title="Move down">
                <ArrowDown className="h-4 w-4" />
              </Button>
            </>
          )}
          {onDuplicate && (
            <Button size="icon" variant="ghost" onClick={() => onDuplicate(id)} title="Duplicate widget">
              <Copy className="h-4 w-4" />
            </Button>
          )}
          <Button size="icon" variant="ghost" onClick={() => onRemove(id)} title="Remove widget">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div
          className="rounded-md border"
          style={{ backgroundColor: background, color: foreground }}
        >
          <div className="pointer-events-auto p-4">{children}</div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`${id}-name`}>Display name</Label>
            <Input
              id={`${id}-name`}
              value={name ?? ''}
              placeholder={widget?.name ?? 'Widget name'}
              onChange={(event) => onNameChange(id, event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select value={theme} onValueChange={(value) => onPropChange(id, { theme: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {theme === 'custom' && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`${id}-background`}>Background</Label>
              <Input
                id={`${id}-background`}
                type="color"
                value={customBackgroundColor ?? '#ffffff'}
                onChange={(event) => onPropChange(id, { customBackgroundColor: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${id}-foreground`}>Text</Label>
              <Input
                id={`${id}-foreground`}
                type="color"
                value={customTextColor ?? '#000000'}
                onChange={(event) => onPropChange(id, { customTextColor: event.target.value })}
              />
            </div>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Width</Label>
            <Select
              value={String(width)}
              onValueChange={(value) => onSizeChange(id, { width: Number(value), height })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Width" />
              </SelectTrigger>
              <SelectContent>
                {SIZE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option} column{option > 1 ? 's' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Height</Label>
            <Select
              value={String(height)}
              onValueChange={(value) => onSizeChange(id, { width, height: Number(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Height" />
              </SelectTrigger>
              <SelectContent>
                {SIZE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option} row{option > 1 ? 's' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
