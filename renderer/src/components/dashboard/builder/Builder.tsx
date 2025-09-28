import { Canvas } from './Canvas'
import { Templates } from './Templates'
import { BuilderSidebar, SidebarInset, SidebarProvider } from './Sidebar'
import { BuilderProvider, useBuilderStore } from '@/store/builderStore'
import { useSettings } from '@/store/SettingsContext'
import { cn } from '@/lib/utils'

function BuilderLayout() {
  const {
    activePage,
    view,
    hydrated,
    addWidget,
    removeWidget,
    updateWidget,
    applyTemplate,
    setView,
  } = useBuilderStore()
  const { featureFlags } = useSettings()
  const glassBackground = Boolean(featureFlags.glassBackground)

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
      <div
        className={cn(
          'flex h-svh bg-background',
          glassBackground &&
            'supports-[backdrop-filter]:backdrop-blur-2xl bg-white/40 text-foreground shadow-[0_30px_80px_-40px_rgba(15,23,42,0.35)] transition-colors dark:bg-slate-950/50 dark:text-slate-100',
        )}
      >
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
