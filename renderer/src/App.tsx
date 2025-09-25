import './App.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import BuilderPage from '@/routes/BuilderPage'
import DashboardPage from '@/routes/DashboardPage'
import Settings from '@/routes/Settings'
import { SettingsProvider } from '@/context/SettingsContext'

function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <div className="flex min-h-screen flex-col bg-background text-foreground">
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Navigate to="/builder" replace />} />
              <Route path="/builder" element={<BuilderPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/builder" replace />} />
            </Routes>
          </main>
          <footer className="border-t px-6 py-4 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Gidit. All rights reserved.
          </footer>
          <Toaster />
        </div>
      </SettingsProvider>
    </BrowserRouter>
  )
}

export default App
