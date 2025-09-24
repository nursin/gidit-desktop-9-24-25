import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function AppSettingsDialog({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children ?? <Button>Open Settings</Button>}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>App Settings</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground">Settings dialog placeholder.</div>
      </DialogContent>
    </Dialog>
  )
}

