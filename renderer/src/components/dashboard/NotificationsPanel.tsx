import { useState } from 'react'
import {
  Bell,
  Lightbulb,
  Mail,
  MessageSquare,
  Phone,
  Settings,
  Twitter,
  Voicemail,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

const notifications = [
  {
    id: 1,
    icon: <Mail className="h-5 w-5 text-red-500" />,
    title: 'New Email from Jane Doe',
    description: 'Project Update: Q3 Report attached...',
    time: '2m ago',
    read: false,
  },
  {
    id: 2,
    icon: <MessageSquare className="h-5 w-5 text-blue-500" />,
    title: 'Slack Message in #general',
    description: '@channel: Don\'t forget the team lunch tomorrow at noon!',
    time: '15m ago',
    read: false,
  },
  {
    id: 5,
    icon: <Twitter className="h-5 w-5 text-sky-500" />,
    title: 'New Mention on X',
    description: 'John Smith mentioned you in a post about Next.js.',
    time: '45m ago',
    read: false,
  },
  {
    id: 3,
    icon: <Phone className="h-5 w-5 text-green-500" />,
    title: 'SMS from (555) 123-4567',
    description: 'Your appointment is confirmed for Friday at 2:00 PM.',
    time: '1h ago',
    read: true,
  },
  {
    id: 6,
    icon: <Voicemail className="h-5 w-5 text-indigo-500" />,
    title: 'New Voicemail',
    description: 'You have a new voicemail from an unknown number.',
    time: '2h ago',
    read: true,
  },
  {
    id: 4,
    icon: <Lightbulb className="h-5 w-5 text-yellow-500" />,
    title: 'New Task Suggestions',
    description: 'Smart suggestions have been generated based on your recent activity.',
    time: '3h ago',
    read: true,
  },
]

const communicationSources = [
  { id: 'gmail', name: 'Gmail', icon: <Mail className="h-5 w-5 text-red-500" /> },
  { id: 'slack', name: 'Slack', icon: <MessageSquare className="h-5 w-5 text-blue-500" /> },
  { id: 'sms', name: 'SMS Messages', icon: <Phone className="h-5 w-5 text-green-500" /> },
  { id: 'twitter', name: 'X / Twitter', icon: <Twitter className="h-5 w-5 text-sky-500" /> },
  { id: 'voicemail', name: 'Voicemail', icon: <Voicemail className="h-5 w-5 text-indigo-500" /> },
]

export default function NotificationsPanel({ name = 'Assistant' }: { name?: string }) {
  const [connections, setConnections] = useState({
    gmail: true,
    slack: true,
    sms: true,
    twitter: true,
    voicemail: true,
  })

  const handleConnectionChange = (id: keyof typeof connections, checked: boolean) => {
    setConnections((prev) => ({ ...prev, [id]: checked }))
  }

  return (
    <Card className="flex h-full flex-col border-0 bg-transparent shadow-none rounded-none">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>{name}</CardTitle>
              <CardDescription>Recent updates from all your sources.</CardDescription>
            </div>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                Connect Sources
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Connect Communication Sources</DialogTitle>
                <DialogDescription>
                  Toggle which sources you want to see notifications from in your assistant panel.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {communicationSources.map((source) => (
                  <div key={source.id} className="flex items-center justify-between rounded-lg border p-2">
                    <div className="flex items-center gap-3">
                      {source.icon}
                      <Label htmlFor={`switch-${source.id}`} className="font-medium">
                        {source.name}
                      </Label>
                    </div>
                    <Switch
                      id={`switch-${source.id}`}
                      checked={connections[source.id as keyof typeof connections]}
                      onCheckedChange={(checked) =>
                        handleConnectionChange(source.id as keyof typeof connections, checked)
                      }
                    />
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 p-0">
        <ScrollArea className="h-full">
          <div className="flex flex-col">
            {notifications.map((notification, index) => (
              <div key={notification.id}>
                <div
                  className={cn(
                    'flex items-start gap-4 p-4',
                    !notification.read && 'bg-background/50',
                  )}
                >
                  <div className="mt-1 flex-shrink-0">{notification.icon}</div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">{notification.description}</p>
                  </div>
                  <div className="flex-shrink-0 text-xs text-muted-foreground">{notification.time}</div>
                </div>
                {index < notifications.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
