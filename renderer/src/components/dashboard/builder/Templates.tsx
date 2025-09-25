import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { templates, type Template } from './TemplateData'
import { Item } from './Types'
import { WIDGETS } from './widgets'

function TemplatePreview({ items }: { items: Omit<Item, 'id'>[] }) {
  return (
    <div className="rounded-lg border bg-muted/40 p-4">
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
        {items.map((item, index) => (
          <div
            key={`${item.widgetId}-${index}`}
            className="overflow-hidden rounded-md border bg-card"
            style={{ gridColumn: `span ${item.width}`, gridRow: `span ${item.height}` }}
          >
            <div className="pointer-events-none scale-95 transform-gpu opacity-80">
              {WIDGETS[item.widgetId]?.component ?? <div className="p-2 text-xs">{item.widgetId}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Templates({ onUseTemplate }: { onUseTemplate: (template: Template) => void }) {
  return (
    <div className="flex h-full flex-col bg-background">
      <header className="border-b px-6 py-4">
        <p className="text-sm text-muted-foreground">Start quickly</p>
        <h1 className="text-xl font-semibold">Template gallery</h1>
      </header>
      <ScrollArea className="flex-1">
        <div className="grid gap-6 p-6 md:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className="flex h-full flex-col">
              <CardHeader>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                <TemplatePreview items={template.items} />
                <Button onClick={() => onUseTemplate(template)}>Use this template</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
