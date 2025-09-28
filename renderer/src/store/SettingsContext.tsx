import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const DEFAULT_COLORS: Record<'primary' | 'accent' | 'background', string> = {
  primary: '#3391F3',
  accent: '#33F3CD',
  background: '#F0F5FA',
}

const FONT_CLASSES = ['font-inter', 'font-roboto', 'font-lato', 'font-montserrat']

const ICON_SIZE_MAP: Record<'sm' | 'md' | 'lg', string> = {
  sm: '1.125rem',
  md: '1.25rem',
  lg: '1.5rem',
}

const hexToRgb = (hex: string) => {
  let sanitized = hex.trim().replace('#', '')
  if (sanitized.length === 3) {
    sanitized = sanitized
      .split('')
      .map((char) => `${char}${char}`)
      .join('')
  }

  if (sanitized.length !== 6) {
    return { r: 51, g: 145, b: 243 }
  }

  return {
    r: parseInt(sanitized.slice(0, 2), 16),
    g: parseInt(sanitized.slice(2, 4), 16),
    b: parseInt(sanitized.slice(4, 6), 16),
  }
}

const getLuminance = (hex: string) => {
  const { r, g, b } = hexToRgb(hex)
  const srgb = [r, g, b].map((value) => {
    const channel = value / 255
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2]
}

const getReadableForeground = (hex: string) =>
  getLuminance(hex) > 0.6 ? '222.2 47.4% 11.2%' : '210 40% 98%'

const hexToHsl = (hex: string): string => {
  let sanitized = hex.trim().replace('#', '')
  if (sanitized.length === 3) {
    sanitized = sanitized
      .split('')
      .map((char) => `${char}${char}`)
      .join('')
  }

  if (sanitized.length !== 6) {
    return '210 75% 50%'
  }

  const r = parseInt(sanitized.slice(0, 2), 16) / 255
  const g = parseInt(sanitized.slice(2, 4), 16) / 255
  const b = parseInt(sanitized.slice(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min

  let h = 0
  if (delta !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / delta) % 6
        break
      case g:
        h = (b - r) / delta + 2
        break
      default:
        h = (r - g) / delta + 4
        break
    }
  }
  h = Math.round(h * 60)
  if (h < 0) h += 360

  const l = (max + min) / 2
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1))

  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

type Settings = {
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  font: string;
  setFont: (f: string) => void;
  iconSize: 'sm' | 'md' | 'lg';
  setIconSize: (s: 'sm' | 'md' | 'lg') => void;
  customColors: Record<string, string>;
  setCustomColors: (c: Record<string, string>) => void;
  aiProvider: string;
  setAiProvider: (p: string) => void;
  apiKeys: Record<string, string>;
  setApiKeys: (k: Record<string, string>) => void;
  featureFlags: Record<string, boolean>;
  setFeatureFlags: (f: Record<string, boolean>) => void;
  resetToDefaults: () => void;
}

const Ctx = createContext<Settings | null>(null)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [font, setFont] = useState('font-inter')
  const [iconSize, setIconSize] = useState<'sm' | 'md' | 'lg'>('md')
  const [customColors, setCustomColors] = useState<Record<string, string>>({})
  const [aiProvider, setAiProvider] = useState('openai')
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({})
  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>({})

  const resetToDefaults = () => {
    setTheme('light')
    setFont('font-inter')
    setIconSize('md')
    setCustomColors({})
    setAiProvider('openai')
    setApiKeys({})
    setFeatureFlags({})
  }

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    const root = document.documentElement
    FONT_CLASSES.forEach((fontClass) => {
      if (fontClass !== font) {
        root.classList.remove(fontClass)
      }
    })
    if (!root.classList.contains(font)) {
      root.classList.add(font)
    }
  }, [font])

  useEffect(() => {
    const root = document.documentElement
    const palette = {
      primary: customColors.primary ?? DEFAULT_COLORS.primary,
      accent: customColors.accent ?? DEFAULT_COLORS.accent,
      background: customColors.background ?? DEFAULT_COLORS.background,
    }

    const primaryForeground = getReadableForeground(palette.primary)
    const accentForeground = getReadableForeground(palette.accent)
    const backgroundForeground = getReadableForeground(palette.background)

    root.style.setProperty('--primary', hexToHsl(palette.primary))
    root.style.setProperty('--primary-foreground', primaryForeground)
    root.style.setProperty('--sidebar-primary', hexToHsl(palette.primary))
    root.style.setProperty('--sidebar-primary-foreground', primaryForeground)
    root.style.setProperty('--ring', hexToHsl(palette.primary))

    root.style.setProperty('--accent', hexToHsl(palette.accent))
    root.style.setProperty('--accent-foreground', accentForeground)
    root.style.setProperty('--sidebar-accent', hexToHsl(palette.accent))
    root.style.setProperty('--sidebar-accent-foreground', accentForeground)

    const backgroundHsl = hexToHsl(palette.background)
    root.style.setProperty('--background', backgroundHsl)
    root.style.setProperty('--foreground', backgroundForeground)
    root.style.setProperty('--card', backgroundHsl)
    root.style.setProperty('--card-foreground', backgroundForeground)
    root.style.setProperty('--popover', backgroundHsl)
    root.style.setProperty('--popover-foreground', backgroundForeground)
    root.style.setProperty('--sidebar-background', backgroundHsl)
    root.style.setProperty('--sidebar-foreground', backgroundForeground)
    root.style.setProperty('--muted', backgroundHsl)
    root.style.setProperty('--muted-foreground', backgroundForeground)
  }, [customColors])

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--app-icon-size', ICON_SIZE_MAP[iconSize])
  }, [iconSize])

  useEffect(() => {
    const root = document.documentElement
    const glassActive = featureFlags.glassBackground || featureFlags.glassSidebar || featureFlags.glassWidgets
    root.dataset.glassEnabled = glassActive ? 'true' : 'false'
  }, [featureFlags.glassBackground, featureFlags.glassSidebar, featureFlags.glassWidgets])

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      font,
      setFont,
      iconSize,
      setIconSize,
      customColors,
      setCustomColors,
      aiProvider,
      setAiProvider,
      apiKeys,
      setApiKeys,
      featureFlags,
      setFeatureFlags,
      resetToDefaults,
    }),
    [
      theme,
      font,
      iconSize,
      customColors,
      aiProvider,
      apiKeys,
      featureFlags,
    ],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useSettings() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useSettings must be used within SettingsProvider')
  return v
}
