import { Button } from '@/components/ui/button'
import { Canvas } from './Canvas'
import { Templates } from './Templates'
import { BuilderSidebar, SidebarInset, SidebarProvider } from './Sidebar'
import { BuilderProvider, useBuilderStore } from '@/store/builderStore'

function BuilderLayout() {
  const {
    activePage,
    view,
    hydrated,
    addWidget,
    removeWidget,
    updateWidget,
    duplicateWidget,
    moveWidget,
    clearPage,
    applyTemplate,
    setView,
  } = useBuilderStore()

  if (!hydrated && !activePage) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Loading builder…
      </div>
    )
  }

  if (!activePage) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Unable to load builder workspace.
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex h-svh bg-background">
        <BuilderSidebar />
        <SidebarInset>
          {view === 'canvas' ? (
            <div className="flex h-full flex-1 flex-col">
              <header className="flex items-center justify-between border-b px-6 py-4">
                <div>
                  <p className="text-sm text-muted-foreground">Active page</p>
                  <h1 className="text-xl font-semibold">{activePage.name}</h1>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="ghost" onClick={() => setView('templates')}>
                    Browse templates
                  </Button>
                  <Button variant="outline" onClick={() => clearPage()}>
                    Clear page
                  </Button>
                </div>
              </header>
              <Canvas
                items={activePage.items}
                onRemoveWidget={removeWidget}
                onSizeChange={(id, size) => updateWidget(id, size)}
                onNameChange={(id, name) => updateWidget(id, { name })}
                onPropChange={(id, props) => updateWidget(id, props)}
                onDropWidget={addWidget}
                onDuplicateWidget={duplicateWidget}
                onMoveWidget={moveWidget}
              />
            </div>
          ) : (
            <Templates
              onUseTemplate={(template) => {
                applyTemplate(template)
                setView('canvas')
              }}
            />
          )}
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

export function Builder() {
  return (
    <BuilderProvider>
      <BuilderLayout />
    </BuilderProvider>
  )
}
