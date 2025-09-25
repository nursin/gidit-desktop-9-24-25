import { createContext, useContext, useState } from 'react';

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
};

const Ctx = createContext<Settings | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [font, setFont] = useState('font-inter');
  const [iconSize, setIconSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [customColors, setCustomColors] = useState<Record<string, string>>({});
  const [aiProvider, setAiProvider] = useState('openai');
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>({});

  const resetToDefaults = () => {
    setTheme('light');
    setFont('font-inter');
    setIconSize('md');
    setCustomColors({});
    setAiProvider('openai');
    setApiKeys({});
    setFeatureFlags({});
  };

  return (
    <Ctx.Provider value={{ theme, setTheme, font, setFont, iconSize, setIconSize, customColors, setCustomColors, aiProvider, setAiProvider, apiKeys, setApiKeys, featureFlags, setFeatureFlags, resetToDefaults }}>
      {children}
    </Ctx.Provider>
  );
}

export function useSettings() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSettings must be used within SettingsProvider');
  return v;
}

