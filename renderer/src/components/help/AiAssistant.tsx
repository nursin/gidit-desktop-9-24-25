import { useState } from 'react'
import { Bot, Sparkles, Send } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const QUICK_SUGGESTIONS = [
  'How do I add a widget?',
  'Give me a productivity tip',
  'I have some feedback',
  'What is my schedule today?',
  'What am I forgetting?',
  'Chat with a representative',
]

type AiAssistantProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AiAssistant({ open, onOpenChange }: AiAssistantProps) {
  const [message, setMessage] = useState('')

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!message.trim()) return
    console.info('[assistant] user message:', message)
    setMessage('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[80vh] max-w-lg flex-col sm:max-w-[425px] md:max-w-[600px]">
        <DialogHeader className="text-center sm:text-left">
          <DialogTitle>Giddy</DialogTitle>
          <DialogDescription>Your helpful assistant for anything you need in the app.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="-mx-6 flex-1 px-6">
          <div className="space-y-4 pb-6">
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-muted">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="max-w-[80%] rounded-lg bg-secondary p-3 text-sm">
                Hello! I'm Giddy. How can I help you with Gidit today?
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pl-12">
              {QUICK_SUGGESTIONS.map((suggestion) => (
                <Button key={suggestion} variant="outline" className="h-9" onClick={() => setMessage(suggestion)}>
                  <Sparkles className="mr-2 h-3 w-3" />
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        </ScrollArea>
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            placeholder="Type your message..."
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
          <Button type="submit" disabled={!message.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
