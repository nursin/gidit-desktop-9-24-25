import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react'
import type { Item, Page, View } from './Types'
import type { Template } from './TemplateData'
import { WIDGETS } from './widgets'

const STORAGE_KEY = 'gidit-builder-state-v1'

const createDefaultPage = (name = 'Dashboard'): Page => ({
  id: uid(),
  name,
  icon: 'LayoutDashboard',
  items: [],
})

const initialState: BuilderState = {
  pages: [createDefaultPage()],
  activePageId: '',
  view: 'canvas',
  hydrated: false,
}

const INIT_ACTION: BuilderAction = { type: 'HYDRATE', payload: initialState }

function reducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    case 'HYDRATE': {
      const { pages, activePageId, view } = action.payload
      const safePages = pages.length ? pages : [createDefaultPage()]
      const safeActive = safePages.find((page) => page.id === activePageId)?.id ?? safePages[0].id
      return {
        pages: safePages,
        activePageId: safeActive,
        view: view ?? 'canvas',
        hydrated: true,
      }
    }
    case 'SET_VIEW': {
      if (state.view === action.payload.view) return state
      return { ...state, view: action.payload.view }
    }
    case 'SET_ACTIVE_PAGE': {
      if (state.activePageId === action.payload.pageId) return state
      const exists = state.pages.some((page) => page.id === action.payload.pageId)
      if (!exists) return state
      return { ...state, activePageId: action.payload.pageId }
    }
    case 'ADD_PAGE': {
      const page: Page = action.payload?.page ?? createDefaultPage(action.payload?.name)
      return {
        ...state,
        pages: [...state.pages, page],
        activePageId: page.id,
      }
    }
    case 'UPDATE_PAGE': {
      const pages = state.pages.map((page) =>
        page.id === action.payload.pageId ? { ...page, ...action.payload.updates } : page,
      )
      return { ...state, pages }
    }
    case 'DELETE_PAGE': {
      const pages = state.pages.filter((page) => page.id !== action.payload.pageId)
      if (!pages.length) {
        const fallback = createDefaultPage()
        return {
          pages: [fallback],
          activePageId: fallback.id,
          view: state.view,
          hydrated: state.hydrated,
        }
      }
      const activePageId =
        state.activePageId === action.payload.pageId ? pages[0].id : state.activePageId
      return { ...state, pages, activePageId }
    }
    case 'SET_PAGE_ITEMS': {
      const pages = state.pages.map((page) =>
        page.id === action.payload.pageId ? { ...page, items: action.payload.items } : page,
      )
      return { ...state, pages }
    }
    default:
      return state
  }
}

//#region types
interface BuilderState {
  pages: Page[]
  activePageId: string
  view: View
  hydrated: boolean
}

type BuilderAction =
  | { type: 'HYDRATE'; payload: BuilderState }
  | { type: 'SET_VIEW'; payload: { view: View } }
  | { type: 'SET_ACTIVE_PAGE'; payload: { pageId: string } }
  | { type: 'ADD_PAGE'; payload?: { name?: string; page?: Page } }
  | { type: 'UPDATE_PAGE'; payload: { pageId: string; updates: Partial<Page> } }
  | { type: 'DELETE_PAGE'; payload: { pageId: string } }
  | { type: 'SET_PAGE_ITEMS'; payload: { pageId: string; items: Item[] } }

interface BuilderContextValue {
  pages: Page[]
  activePageId: string
  activePage: Page
  view: View
  hydrated: boolean
  setView: (view: View) => void
  setActivePage: (pageId: string) => void
  addPage: (name?: string) => string
  updatePage: (pageId: string, updates: Partial<Page>) => void
  deletePage: (pageId: string) => void
  addWidget: (widgetId: string) => Item | null
  removeWidget: (itemId: string) => void
  updateWidget: (itemId: string, updates: Partial<Item>) => void
  duplicateWidget: (itemId: string) => Item | null
  moveWidget: (itemId: string, direction: 'up' | 'down') => void
  clearPage: () => void
  applyTemplate: (template: Template) => void
}
//#endregion

const BuilderContext = createContext<BuilderContextValue | undefined>(undefined)

export function BuilderProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, () => {
    // initialize with active page selected
    const seeded = { ...initialState }
    seeded.activePageId = seeded.pages[0].id
    return seeded
  })

  const hydratedRef = useRef(false)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        dispatch(INIT_ACTION)
        hydratedRef.current = true
        return
      }
      const parsed = JSON.parse(raw) as Partial<BuilderState>
      if (!parsed || !Array.isArray(parsed.pages)) {
        dispatch(INIT_ACTION)
        hydratedRef.current = true
        return
      }
      dispatch({
        type: 'HYDRATE',
        payload: {
          pages: parsed.pages,
          activePageId: parsed.activePageId ?? parsed.pages[0]?.id ?? '',
          view: parsed.view ?? 'canvas',
          hydrated: true,
        },
      })
    } catch (error) {
      console.warn('Failed to load builder state, falling back to defaults.', error)
      dispatch(INIT_ACTION)
    } finally {
      hydratedRef.current = true
    }
  }, [])

  useEffect(() => {
    if (!state.hydrated || !hydratedRef.current) return
    const payload: BuilderState = {
      pages: state.pages,
      activePageId: state.activePageId,
      view: state.view,
      hydrated: true,
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch (error) {
      console.warn('Unable to persist builder state.', error)
    }
  }, [state.pages, state.activePageId, state.view, state.hydrated])

  const getActivePage = useCallback(
    () => state.pages.find((page) => page.id === state.activePageId) ?? state.pages[0],
    [state.pages, state.activePageId],
  )

  const setView = useCallback((view: View) => {
    dispatch({ type: 'SET_VIEW', payload: { view } })
  }, [])

  const setActivePage = useCallback((pageId: string) => {
    dispatch({ type: 'SET_ACTIVE_PAGE', payload: { pageId } })
  }, [])

  const setItems = useCallback(
    (pageId: string, updater: (items: Item[]) => Item[]) => {
      const page = state.pages.find((p) => p.id === pageId)
      if (!page) return
      const nextItems = updater(page.items)
      dispatch({ type: 'SET_PAGE_ITEMS', payload: { pageId, items: nextItems } })
    },
    [state.pages],
  )

  const addPage = useCallback(
    (name?: string) => {
      const page = createDefaultPage(name)
      dispatch({ type: 'ADD_PAGE', payload: { page } })
      return page.id
    },
    [],
  )

  const updatePage = useCallback((pageId: string, updates: Partial<Page>) => {
    dispatch({ type: 'UPDATE_PAGE', payload: { pageId, updates } })
  }, [])

  const deletePage = useCallback((pageId: string) => {
    dispatch({ type: 'DELETE_PAGE', payload: { pageId } })
  }, [])

  const addWidget = useCallback(
    (widgetId: string) => {
      const widget = WIDGETS[widgetId]
      const pageId = getActivePage().id
      if (!widget) {
        console.warn('Unknown widget', widgetId)
        return null
      }
      const item: Item = {
        id: `${widgetId}-${uid()}`,
        widgetId,
        name: widget.name,
        width: widget.initialWidth ?? 2,
        height: widget.initialHeight ?? 2,
      }
      setItems(pageId, (items) => [...items, item])
      return item
    },
    [getActivePage, setItems],
  )

  const removeWidget = useCallback(
    (itemId: string) => {
      const pageId = getActivePage().id
      setItems(pageId, (items) => items.filter((item) => item.id !== itemId))
    },
    [getActivePage, setItems],
  )

  const updateWidget = useCallback(
    (itemId: string, updates: Partial<Item>) => {
      const pageId = getActivePage().id
      setItems(pageId, (items) =>
        items.map((item) => (item.id === itemId ? { ...item, ...updates } : item)),
      )
    },
    [getActivePage, setItems],
  )

  const duplicateWidget = useCallback(
    (itemId: string) => {
      const activePage = getActivePage()
      const existing = activePage.items.find((item) => item.id === itemId)
      if (!existing) return null
      const clone: Item = {
        ...existing,
        id: `${existing.widgetId}-${uid()}`,
        name: `${existing.name ?? WIDGETS[existing.widgetId]?.name ?? 'Widget'} (copy)`,
      }
      setItems(activePage.id, (items) => [...items, clone])
      return clone
    },
    [getActivePage, setItems],
  )

  const moveWidget = useCallback(
    (itemId: string, direction: 'up' | 'down') => {
      const activePage = getActivePage()
      setItems(activePage.id, (items) => {
        const index = items.findIndex((item) => item.id === itemId)
        if (index === -1) return items
        const targetIndex = direction === 'up' ? index - 1 : index + 1
        if (targetIndex < 0 || targetIndex >= items.length) return items
        const next = [...items]
        const [moved] = next.splice(index, 1)
        next.splice(targetIndex, 0, moved)
        return next
      })
    },
    [getActivePage, setItems],
  )

  const clearPage = useCallback(() => {
    const activePage = getActivePage()
    setItems(activePage.id, () => [])
  }, [getActivePage, setItems])

  const applyTemplate = useCallback(
    (template: Template) => {
      const page: Page = {
        id: uid(),
        name: template.name,
        icon: 'Template',
        items: template.items.map((item) => ({
          ...item,
          id: `${item.widgetId}-${uid()}`,
        })) as Item[],
      }
      dispatch({ type: 'ADD_PAGE', payload: { page } })
    },
    [],
  )

  const value = useMemo<BuilderContextValue>(() => {
    const activePage = getActivePage()
    return {
      pages: state.pages,
      activePageId: activePage?.id ?? state.pages[0].id,
      activePage,
      view: state.view,
      hydrated: state.hydrated,
      setView,
      setActivePage,
      addPage,
      updatePage,
      deletePage,
      addWidget,
      removeWidget,
      updateWidget,
      duplicateWidget,
      moveWidget,
      clearPage,
      applyTemplate,
    }
  }, [
    state.pages,
    state.view,
    state.hydrated,
    getActivePage,
    setView,
    setActivePage,
    addPage,
    updatePage,
    deletePage,
    addWidget,
    removeWidget,
    updateWidget,
    duplicateWidget,
    moveWidget,
    clearPage,
    applyTemplate,
  ])

  return <BuilderContext.Provider value={value}>{children}</BuilderContext.Provider>
}

export function useBuilderStore(): BuilderContextValue {
  const context = useContext(BuilderContext)
  if (!context) {
    throw new Error('useBuilderStore must be used within a BuilderProvider')
  }
  return context
}

function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2, 10)
}
