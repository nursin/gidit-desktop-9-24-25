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
        <SidebarInset
          className="w-full transition-[padding] md:pl-[var(--sidebar-width-icon)] md:peer-data-[state=expanded]:pl-[var(--sidebar-width)] md:peer-data-[collapsible=offcanvas]:pl-0"
        >
          {view === 'canvas' ? (
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
          ) : (
            <Templates
              onUseTemplate={(template) => {
                applyTemplate(template)
                setView('canvas')
              }}
              onBack={() => setView('canvas')}
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
