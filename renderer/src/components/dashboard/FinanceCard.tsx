import { useRef, useState, useTransition } from 'react'
import { Banknote, Loader2, Receipt, TrendingUp, Upload } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/hooks/useToast'

const mockReceipt = {
  store: {
    name: 'Fresh Mart',
    address: '123 Market Street, Springfield',
    phone: '(555) 123-4567',
  },
  transaction: {
    date: new Date().toLocaleDateString(),
    time: '14:32',
  },
  items: [
    { description: 'Organic Apples', quantity: 4, total_price: 6 },
    { description: 'Almond Milk', quantity: 2, total_price: 7.98 },
    { description: 'Granola Bars', quantity: 1, total_price: 4.5 },
  ],
  totals: {
    subtotal: 18.48,
    taxes: 1.56,
    total: 20.04,
  },
  payment: {
    type: 'Card',
    card_last_four: '2045',
  },
}

const mockProcessReceipt = async () => {
  await new Promise((resolve) => setTimeout(resolve, 700))
  return mockReceipt
}

export default function FinanceCard({ name = 'Finance Overview' }: { name?: string }) {
  const [receipt, setReceipt] = useState<typeof mockReceipt | null>(null)
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const { toast } = useToast()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    startTransition(async () => {
      setReceipt(null)
      try {
        const result = await mockProcessReceipt()
        setReceipt(result)
        toast({ title: 'Receipt processed', description: `${result.store.name} • ${result.transaction.date}` })
      } catch (error) {
        console.error(error)
        const description = error instanceof Error ? error.message : 'Could not process the receipt.'
        toast({ title: 'Processing failed', description, variant: 'destructive' })
      }
    })

    event.target.value = ''
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <Card className="flex h-full flex-col border-0 bg-transparent shadow-none rounded-none">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Banknote className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>Track spending and upload receipts.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="min-h-0 flex-1">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-medium">Monthly Budget</p>
            <p className="font-semibold text-green-600">$1,250 / $2,000</p>
          </div>
          <div className="h-2.5 w-full rounded-full bg-secondary">
            <div className="h-2.5 rounded-full bg-green-500" style={{ width: '62.5%' }} />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4 text-primary" />
            <p>Spending is on track for this month.</p>
          </div>
        </div>
        <Separator className="my-6" />
        <div className="flex min-h-0 flex-1 flex-col">
          <h4 className="mb-2 flex items-center gap-2 font-semibold">
            <Receipt className="h-5 w-5 text-primary" /> Receipt OCR
          </h4>
          <Input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          <Button onClick={handleUploadClick} disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Upload Receipt
          </Button>
          <ScrollArea className="-mx-6 mt-4 flex-1">
            <div className="px-6">
              {isPending && (
                <div className="flex h-28 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}
              {receipt && !isPending && (
                <div className="rounded-none border border-border bg-secondary/50 p-4 text-sm">
                  <div className="mb-4 text-center">
                    <h5 className="text-lg font-bold">{receipt.store.name}</h5>
                    <p className="text-xs text-muted-foreground">{receipt.store.address}</p>
                    <p className="text-xs text-muted-foreground">{receipt.store.phone}</p>
                  </div>
                  <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                    <span>{receipt.transaction.date}</span>
                    <span>{receipt.transaction.time}</span>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {receipt.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="py-1 font-medium">{item.description}</TableCell>
                          <TableCell className="py-1 text-center">{item.quantity}</TableCell>
                          <TableCell className="py-1 text-right">
                            ${item.total_price?.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={2} className="text-right font-semibold">
                          Subtotal
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          ${receipt.totals.subtotal?.toFixed(2)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={2} className="text-right font-semibold">
                          Taxes
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          ${receipt.totals.taxes?.toFixed(2)}
                        </TableCell>
                      </TableRow>
                      <TableRow className="text-lg">
                        <TableCell colSpan={2} className="text-right font-bold">
                          Total
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          ${receipt.totals.total?.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                  <div className="mt-4 text-center text-xs text-muted-foreground">
                    Paid with {receipt.payment.type}
                    {receipt.payment.card_last_four ? ` ending in ${receipt.payment.card_last_four}` : ''}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
}
