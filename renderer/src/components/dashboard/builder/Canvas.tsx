import { useCallback, useRef } from 'react'
import { toast } from '@/hooks/useToast'
import { Item } from './Types'
import { WidgetWrapper } from './WidgetWrapper'
import { WIDGETS } from './widgets'
import { Grip } from "lucide-react"
type CanvasProps = {
  items: Item[]
  onRemoveWidget: (id: string) => void
  onSizeChange: (id: string, size: { width: number; height: number }) => void
  onNameChange: (id: string, name: string) => void
  onPropChange: (id: string, props: Record<string, unknown>) => void
  onDropWidget: (widgetId: string) => void
  onDuplicateWidget?: (id: string) => void
  onMoveWidget?: (id: string, direction: 'up' | 'down') => void
}

const CELL_HEIGHT = 160

export function Canvas({
  items,
  onRemoveWidget,
  onSizeChange,
  onNameChange,
  onPropChange,
  onDropWidget,
  onDuplicateWidget,
  onMoveWidget,
}: CanvasProps) {
  const surfaceRef = useRef<HTMLDivElement | null>(null)

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      const widgetId = event.dataTransfer.getData('application/widget-id')
      if (widgetId && WIDGETS[widgetId]) {
        onDropWidget(widgetId)
        toast({ title: 'Widget added', description: WIDGETS[widgetId].name })
      }
    },
    [onDropWidget],
  )

  return (
    <div
      ref={surfaceRef}
      className="flex w-full flex-1 flex-col overflow-y-auto"
      onDragOver={(event) => {
        if (event.dataTransfer.types.includes('application/widget-id')) {
          event.preventDefault()
        }
      }}
      onDrop={handleDrop}
    >
      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
          <div className="text-3xl"><Grip /></div>
          <div className="text-lg font-semibold">Drag widgets from the sidebar</div>
          <p className="text-sm">Drop components here to build your dashboard layout.</p>
        </div>
      ) : (
        <div
          className="grid w-full flex-1 gap-5 p-6"
          style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gridAutoRows: `${CELL_HEIGHT}px` }}
        >
          {items.map((item) => {
            const supportsAdvancedActions = item.widgetId !== 'WebBrowser'
            return (
              <div
                key={item.id}
                style={{ gridColumn: `span ${Math.max(1, Math.min(4, item.width))}`, gridRow: `span ${Math.max(1, item.height)}` }}
              >
                <WidgetWrapper
                  id={item.id}
                  widgetId={item.widgetId}
                  name={item.name}
                  width={item.width}
                  height={item.height}
                  theme={item.theme}
                  customBackgroundColor={item.customBackgroundColor}
                  customTextColor={item.customTextColor}
                  onRemove={onRemoveWidget}
                  onSizeChange={onSizeChange}
                  onNameChange={onNameChange}
                  onPropChange={onPropChange}
                  onDuplicate={supportsAdvancedActions ? onDuplicateWidget : undefined}
                  onMove={supportsAdvancedActions ? onMoveWidget : undefined}
                >
                  {WIDGETS[item.widgetId]?.component ?? <div />}
                </WidgetWrapper>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
