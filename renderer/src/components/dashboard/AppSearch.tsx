import { useState } from 'react'
import { Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function AppSearch({ name = 'App Search' }: { name?: string }) {
  const [query, setQuery] = useState('')

  const handleSearch = () => {
    if (!query.trim()) return
    console.log('Searching for:', query) // placeholder
  }

  return (
    <Card className="flex h-full flex-col border-0 bg-transparent shadow-none rounded-none">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Search className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>Search your entire knowledge base.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 items-center justify-center">
        <div className="flex w-full max-w-sm items-center gap-2">
          <Input
            placeholder="Find anything..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
