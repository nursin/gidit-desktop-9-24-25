import { useState, type ReactNode } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useSettings } from '@/store/SettingsContext'

const FONTS = [
  { label: 'Inter', value: 'font-inter' },
  { label: 'Roboto', value: 'font-roboto' },
  { label: 'Lato', value: 'font-lato' },
  { label: 'Montserrat', value: 'font-montserrat' },
]

const ICON_SIZES: Array<{ value: 'sm' | 'md' | 'lg'; label: string }> = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
]

const FEATURE_FLAGS = [
  { key: 'sideQuests', label: 'Side Quests — Randomly appearing, interesting tasks.' },
  { key: 'changeVenue', label: 'Change Venue — Suggest different work environments.' },
  { key: 'noveltyRewards', label: 'Novelty Rewards — Special rewards for starting tasks.' },
  { key: 'interestSurfacing', label: 'Interest-Driven Surfacing — Prioritize tasks based on interests.' },
  { key: 'buildingConfidence', label: 'Building Confidence — Positive reinforcement and celebrating wins.' },
  { key: 'reducingShame', label: 'Reducing Shame — Normalize ADHD challenges.' },
  { key: 'kindnessFlexibility', label: 'Kindness & Flexibility — Adapt the system to energy levels.' },
  { key: 'selfForgiveness', label: 'Self-Forgiveness — Encourage compassion when things slip.' },
]

const GLASS_KEYS = [
  { key: 'glassBackground', label: 'Enable on Background' },
  { key: 'glassSidebar', label: 'Enable on Sidebar' },
  { key: 'glassWidgets', label: 'Enable on Widgets' },
]

const AI_PROVIDERS = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'local', label: 'Local Model' },
]

type AppSettingsDialogProps = {
  children?: ReactNode
  trigger?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function AppSettingsDialog({ children, trigger, open: openProp, onOpenChange }: AppSettingsDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const settings = useSettings()
  const theme = settings.theme
  const setTheme = settings.setTheme
  const font = settings.font
  const setFont = settings.setFont
  const iconSize = settings.iconSize
  const setIconSize = settings.setIconSize
  const customColors = settings.customColors
  const setCustomColors = settings.setCustomColors
  const featureFlags = settings.featureFlags
  const setFeatureFlags = settings.setFeatureFlags
  const aiProvider = settings.aiProvider
  const setAiProvider = settings.setAiProvider
  const apiKeys = settings.apiKeys
  const setApiKeys = settings.setApiKeys
  const resetToDefaults = settings.resetToDefaults

  const primaryColor = customColors.primary ?? '#2080df'
  const accentColor = customColors.accent ?? '#20dfdf'
  const backgroundColor = customColors.background ?? '#f0f2f5'
  const currentApiKey = apiKeys[aiProvider] ?? ''

  const handleColorChange = (key: 'primary' | 'accent' | 'background', value: string) => {
    setCustomColors({ ...customColors, [key]: value })
  }

  const handleFeatureToggle = (flag: string, value: boolean) => {
    setFeatureFlags({ ...featureFlags, [flag]: value })
  }

  const isControlled = openProp !== undefined
  const open = isControlled ? openProp : internalOpen
  const handleOpenChange = (next: boolean) => {
    if (!isControlled) {
      setInternalOpen(next)
    }
    onOpenChange?.(next)
  }

  const triggerNode = trigger ?? children

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {triggerNode ? <DialogTrigger asChild>{triggerNode}</DialogTrigger> : null}
      <DialogContent className="flex h-[80vh] max-w-lg flex-col gap-4 sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>App Settings</DialogTitle>
          <DialogDescription>
            Customize the application&apos;s appearance and manage your data.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="appearance" className="flex min-h-0 flex-1 flex-col">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="ai">AI</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="flex-1 overflow-y-auto pt-4">
            <div className="grid gap-6">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Theme</Label>
                <RadioGroup
                  value={theme}
                  onValueChange={(value: 'light' | 'dark') => setTheme(value)}
                  className="col-span-3 flex items-center gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="theme-light" />
                    <Label htmlFor="theme-light">Light</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="theme-dark" />
                    <Label htmlFor="theme-dark">Dark</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right" htmlFor="color-primary">
                  Primary
                </Label>
                <Input
                  id="color-primary"
                  type="color"
                  value={primaryColor}
                  onChange={(event) => handleColorChange('primary', event.target.value)}
                  className="col-span-3 h-10 p-1"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right" htmlFor="color-accent">
                  Accent
                </Label>
                <Input
                  id="color-accent"
                  type="color"
                  value={accentColor}
                  onChange={(event) => handleColorChange('accent', event.target.value)}
                  className="col-span-3 h-10 p-1"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right" htmlFor="color-background">
                  Background
                </Label>
                <Input
                  id="color-background"
                  type="color"
                  value={backgroundColor}
                  onChange={(event) => handleColorChange('background', event.target.value)}
                  className="col-span-3 h-10 p-1"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right" htmlFor="font-select">
                  Font
                </Label>
                <Select value={font} onValueChange={setFont}>
                  <SelectTrigger id="font-select" className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONTS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Icon Size</Label>
                <RadioGroup
                  value={iconSize}
                  onValueChange={(value) => setIconSize(value as 'sm' | 'md' | 'lg')}
                  className="col-span-3 flex items-center gap-4"
                >
                  {ICON_SIZES.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`icon-${option.value}`} />
                      <Label htmlFor={`icon-${option.value}`}>{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <Separator />

              <div>
                <h4 className="mb-4 text-center font-medium">Liquid Glass Effect</h4>
                <div className="space-y-3">
                  {GLASS_KEYS.map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label htmlFor={key}>{label}</Label>
                      <Switch
                        id={key}
                        checked={Boolean(featureFlags[key])}
                        onCheckedChange={(checked) => handleFeatureToggle(key, checked)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="features" className="flex-1 overflow-y-auto pt-4">
            <div className="space-y-4">
              {FEATURE_FLAGS.map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <Label htmlFor={`feature-${key}`}>{label}</Label>
                  <Switch
                    id={`feature-${key}`}
                    checked={Boolean(featureFlags[key])}
                    onCheckedChange={(checked) => handleFeatureToggle(key, checked)}
                  />
                </div>
              ))}
              <p className="text-sm text-muted-foreground">
                Feature toggles update instantly for your current session.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="ai" className="flex-1 overflow-y-auto pt-4">
            <div className="space-y-6">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right" htmlFor="ai-provider">
                  Provider
                </Label>
                <Select value={aiProvider} onValueChange={setAiProvider}>
                  <SelectTrigger id="ai-provider" className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AI_PROVIDERS.map((provider) => (
                      <SelectItem key={provider.value} value={provider.value}>
                        {provider.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right" htmlFor="ai-api-key">
                  API Key
                </Label>
                <Input
                  id="ai-api-key"
                  type="password"
                  placeholder="Enter API key"
                  value={currentApiKey}
                  onChange={(event) => setApiKeys({ ...apiKeys, [aiProvider]: event.target.value })}
                  className="col-span-3"
                />
              </div>

              <p className="text-xs text-muted-foreground">
                API keys are stored securely on your device. Rotate them regularly for best security practices.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="data" className="flex-1 overflow-y-auto pt-4">
            <div className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button variant="outline" className="flex-1">
                  Export Workspace
                </Button>
                <Button variant="outline" className="flex-1">
                  Import Workspace
                </Button>
              </div>
              <Button variant="destructive" className="w-full">
                Delete All Local Data
              </Button>
              <p className="text-xs text-muted-foreground">
                Data operations affect only your local installation. Ensure you have backups before deleting anything.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:justify-end sm:space-x-2">
          <Button variant="outline" onClick={resetToDefaults}>
            Reset to Defaults
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
