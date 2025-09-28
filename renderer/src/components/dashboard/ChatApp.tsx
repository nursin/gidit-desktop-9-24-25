import { useEffect, useRef, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'
import { MessageSquare, Send, Phone, Video, MoreVertical } from 'lucide-react'

const mockUsers = [
  { id: 'user1', name: 'Alice', avatar: 'https://placehold.co/100x100/A020F0/FFFFFF/png?text=A', online: true },
  { id: 'user2', name: 'Bob', avatar: 'https://placehold.co/100x100/3498DB/FFFFFF/png?text=B', online: false },
  { id: 'user3', name: 'Charlie', avatar: 'https://placehold.co/100x100/2ECC71/FFFFFF/png?text=C', online: true },
]

const mockMessages: Record<string, Array<{ id: string; text: string; senderId: string; timestamp: Date }>> = {
  user1: [
    { id: 'm1', text: "Hey! How's the project going?", senderId: 'user1', timestamp: new Date(Date.now() - 5 * 60_000) },
    { id: 'm2', text: "It's going well! Almost done with the MVP.", senderId: 'me', timestamp: new Date(Date.now() - 4 * 60_000) },
    { id: 'm3', text: "That's great to hear!", senderId: 'user1', timestamp: new Date(Date.now() - 3 * 60_000) },
  ],
  user2: [{ id: 'm4', text: 'Can we reschedule our meeting?', senderId: 'user2', timestamp: new Date(Date.now() - 20 * 60_000) }],
  user3: [],
}

export default function ChatApp({ name = 'Chat App' }: { name?: string }) {
  const [selectedUser, setSelectedUser] = useState(mockUsers[0])
  const [messages, setMessages] = useState(mockMessages[mockUsers[0].id])
  const [inputText, setInputText] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    setMessages(mockMessages[selectedUser.id] ?? [])
  }, [selectedUser])

  useEffect(() => {
    const container = scrollRef.current
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
    }
  }, [messages])

  const handleSendMessage = () => {
    const trimmed = inputText.trim()
    if (!trimmed) return

    const outgoing = {
      id: `m${Date.now()}`,
      text: trimmed,
      senderId: 'me',
      timestamp: new Date(),
    }
    setMessages((current) => [...current, outgoing])
    setInputText('')

    window.setTimeout(() => {
      const reply = {
        id: `m${Date.now() + 1}`,
        text: 'This is an automated reply.',
        senderId: selectedUser.id,
        timestamp: new Date(),
      }
      setMessages((current) => [...current, reply])
    }, 1_500)
  }

  const handleCall = (type: 'voice' | 'video') => {
    toast({
      title: 'Feature coming soon',
      description: `The ${type} call functionality is not yet available.`,
    })
  }

  return (
    <Card className="flex h-full border-0 bg-transparent shadow-none rounded-none">
      <div className="flex w-1/3 flex-col border-r">
        <div className="border-b p-4">
          <Input placeholder="Search contacts..." />
        </div>
        <ScrollArea className="flex-1">
          {mockUsers.map((user) => (
            <button
              key={user.id}
              type="button"
              className={cn(
                'flex w-full items-center gap-3 p-4 text-left transition hover:bg-accent',
                selectedUser.id === user.id && 'bg-accent',
              )}
              onClick={() => setSelectedUser(user)}
            >
              <Avatar className="relative">
                <AvatarImage src={user.avatar} alt="" />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                {user.online && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-green-500" />
                )}
              </Avatar>
              <span className="font-medium">{user.name}</span>
            </button>
          ))}
        </ScrollArea>
      </div>
      <div className="flex w-2/3 flex-col">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={selectedUser.avatar} alt="" />
              <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{selectedUser.name}</h3>
              <p className="text-xs text-muted-foreground">{selectedUser.online ? 'Online' : 'Offline'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => handleCall('voice')}>
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleCall('video')}>
              <Video className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <ScrollArea ref={scrollRef} className="flex-1 bg-secondary/30 p-4">
          <div className="space-y-4">
            {messages.map((message) => {
              const isMe = message.senderId === 'me'
              return (
                <div key={message.id} className={cn('flex items-end gap-2', isMe ? 'justify-end' : 'justify-start')}>
                  {!isMe && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={selectedUser.avatar} alt="" />
                      <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      'max-w-[70%] rounded-lg p-3 text-sm',
                      isMe ? 'bg-primary text-primary-foreground' : 'bg-background',
                    )}
                  >
                    {message.text}
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
        <div className="border-t p-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Type a message..."
              value={inputText}
              onChange={(event) => setInputText(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && handleSendMessage()}
            />
            <Button onClick={handleSendMessage}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
