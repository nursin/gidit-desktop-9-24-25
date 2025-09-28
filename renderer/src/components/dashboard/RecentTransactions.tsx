import { format } from 'date-fns'
import {
  ArrowDownRight,
  ArrowUpRight,
  Car,
  Coffee,
  Home,
  Plane,
  ShoppingCart,
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

const transactions = [
  {
    id: 'txn1',
    merchant: 'Starbucks',
    category: 'Food & Drink',
    date: new Date(),
    amount: -7.5,
    icon: <Coffee className="h-5 w-5 text-yellow-700" />,
  },
  {
    id: 'txn2',
    merchant: 'Amazon',
    category: 'Shopping',
    date: new Date(Date.now() - 86_400_000),
    amount: -124.99,
    icon: <ShoppingCart className="h-5 w-5 text-blue-500" />,
  },
  {
    id: 'txn3',
    merchant: 'Paycheck',
    category: 'Income',
    date: new Date(Date.now() - 172_800_000),
    amount: 1_200,
    icon: <ArrowUpRight className="h-5 w-5 text-green-500" />,
  },
  {
    id: 'txn4',
    merchant: 'Uber',
    category: 'Transport',
    date: new Date(Date.now() - 172_800_000),
    amount: -22.3,
    icon: <Car className="h-5 w-5 text-indigo-500" />,
  },
  {
    id: 'txn5',
    merchant: 'Delta Airlines',
    category: 'Travel',
    date: new Date(Date.now() - 345_600_000),
    amount: -450.78,
    icon: <Plane className="h-5 w-5 text-cyan-500" />,
  },
  {
    id: 'txn6',
    merchant: 'Mortgage Payment',
    category: 'Housing',
    date: new Date(Date.now() - 432_000_000),
    amount: -1_800,
    icon: <Home className="h-5 w-5 text-orange-500" />,
  },
]

export default function RecentTransactions({ name = 'Recent Transactions' }: { name?: string }) {
  return (
    <Card className="flex h-full flex-col border-0 bg-transparent shadow-none rounded-none">
      <CardHeader>
        <div className="flex items-center gap-3">
          <ArrowDownRight className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>Your latest financial activity.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 p-0">
        <ScrollArea className="h-full">
          <div className="space-y-4">
            {transactions.map((transaction) => {
              const isIncome = transaction.amount > 0
              return (
                <div key={transaction.id} className="flex items-center gap-4 px-6">
                  <div className="rounded-full bg-secondary p-2">{transaction.icon}</div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{transaction.merchant}</p>
                    <p className="text-xs text-muted-foreground">{transaction.category}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${isIncome ? 'text-green-600' : ''}`}>
                      {transaction.amount < 0 ? '-' : ''}${Math.abs(transaction.amount).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">{format(transaction.date, 'MMM d')}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
