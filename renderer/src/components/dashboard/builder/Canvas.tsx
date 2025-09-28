import { useCallback, useRef, useState, type DragEvent } from 'react'
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
  onReorderWidget: (sourceId: string, targetId: string | null) => void
}

const CELL_HEIGHT = 160

export function Canvas({
  items,
  onRemoveWidget,
  onSizeChange,
  onNameChange,
  onPropChange,
  onDropWidget,
  onReorderWidget,
}: CanvasProps) {
  const surfaceRef = useRef<HTMLDivElement | null>(null)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

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

  const handleWidgetDragStart = useCallback((event: DragEvent<HTMLButtonElement>, itemId: string) => {
    event.stopPropagation()
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('application/widget-item', itemId)
    setDraggedId(itemId)
  }, [])

  const handleWidgetDragEnter = useCallback(
    (itemId: string) => {
      if (itemId && itemId !== draggedId) {
        setDragOverId(itemId)
      }
    },
    [draggedId],
  )

  const finalizeWidgetDrag = useCallback(
    (targetId: string | null, shouldReorder: boolean) => {
      if (shouldReorder && draggedId) {
        if (targetId && targetId !== draggedId) {
          onReorderWidget(draggedId, targetId)
        } else if (!targetId) {
          onReorderWidget(draggedId, null)
        }
      }
      setDraggedId(null)
      setDragOverId(null)
    },
    [draggedId, onReorderWidget],
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
          className="grid w-full flex-1 gap-px bg-border"
          style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gridAutoRows: `${CELL_HEIGHT}px` }}
        >
          {items.map((item) => {
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
                  onDragStartHandle={(event) => handleWidgetDragStart(event, item.id)}
                  onDragEnterContainer={(event) => {
                    event.preventDefault()
                    handleWidgetDragEnter(item.id)
                  }}
                  onDragOverContainer={(event) => {
                    if (draggedId) {
                      event.preventDefault()
                      event.dataTransfer.dropEffect = 'move'
                    }
                  }}
                  onDropContainer={(event) => {
                    event.preventDefault()
                    finalizeWidgetDrag(item.id, true)
                  }}
                  onDragEndHandle={() => finalizeWidgetDrag(dragOverId, false)}
                  isDragTarget={dragOverId === item.id && draggedId !== item.id}
                  isDragging={draggedId === item.id}
                >
                  {WIDGETS[item.widgetId]?.component ?? <div />}
                </WidgetWrapper>
              </div>
            )
          })}
          {items.length > 0 && (
            <div
              style={{ gridColumn: 'span 4' }}
              onDragOver={(event) => {
                if (draggedId) {
                  event.preventDefault()
                  event.dataTransfer.dropEffect = 'move'
                  setDragOverId(null)
                }
              }}
              onDrop={(event) => {
                if (!draggedId) return
                event.preventDefault()
                finalizeWidgetDrag(null, true)
              }}
              className="h-px bg-border"
            />
          )}
        </div>
      )}
    </div>
  )
}
