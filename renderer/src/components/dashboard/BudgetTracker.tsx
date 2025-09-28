import { useState } from 'react'
import { Car, Clapperboard, Home, Pencil, PiggyBank, ShoppingCart } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

const iconMap = {
  groceries: <ShoppingCart className="h-5 w-5 text-green-500" />,
  transport: <Car className="h-5 w-5 text-blue-500" />,
  entertainment: <Clapperboard className="h-5 w-5 text-purple-500" />,
  housing: <Home className="h-5 w-5 text-orange-500" />,
} as const

const initialCategories = [
  { id: 'cat1', name: 'Groceries', budgeted: 500, spent: 275, icon: iconMap.groceries },
  { id: 'cat2', name: 'Transport', budgeted: 150, spent: 90, icon: iconMap.transport },
  { id: 'cat3', name: 'Entertainment', budgeted: 200, spent: 220, icon: iconMap.entertainment },
  { id: 'cat4', name: 'Housing', budgeted: 1_200, spent: 1_200, icon: iconMap.housing },
]

export default function BudgetTracker({ name = 'Budget Tracker' }: { name?: string }) {
  const [categories, setCategories] = useState(initialCategories)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newBudget, setNewBudget] = useState<number>(0)

  const handleEditClick = (categoryId: string) => {
    const category = categories.find((item) => item.id === categoryId)
    if (!category) return
    setEditingId(categoryId)
    setNewBudget(category.budgeted)
  }

  const handleSaveBudget = () => {
    if (!editingId) return
    setCategories((current) =>
      current.map((category) =>
        category.id === editingId ? { ...category, budgeted: Number.isFinite(newBudget) ? newBudget : category.budgeted } : category,
      ),
    )
    setEditingId(null)
  }

  const totalBudgeted = categories.reduce((total, category) => total + category.budgeted, 0)
  const totalSpent = categories.reduce((total, category) => total + category.spent, 0)
  const overallProgress = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0

  return (
    <Card className="flex h-full flex-col border-0 bg-transparent shadow-none rounded-none">
      <CardHeader>
        <div className="flex items-center gap-3">
          <PiggyBank className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>Monitor your spending by category.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="min-h-0 flex-1">
        <div className="mb-4">
          <div className="mb-1 flex items-baseline justify-between">
            <h4 className="text-sm font-semibold">Overall Budget</h4>
            <p className="text-sm text-muted-foreground">
              <span className="font-bold text-foreground">${totalSpent.toLocaleString()}</span> / $
              {totalBudgeted.toLocaleString()}
            </p>
          </div>
          <Progress value={overallProgress} />
        </div>
        <ScrollArea className="-mx-6 h-full">
          <div className="space-y-4 px-6 pb-4">
            {categories.map((category) => {
              const progress = category.budgeted > 0 ? (category.spent / category.budgeted) * 100 : 0
              const isOverBudget = category.spent > category.budgeted
              const isEditing = editingId === category.id

              return (
                <div key={category.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {category.icon}
                      <h5 className="text-sm font-medium">{category.name}</h5>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">
                        <span className={isOverBudget ? 'font-bold text-destructive' : 'font-bold text-foreground'}>
                          ${category.spent.toLocaleString()}
                        </span>{' '}
                        / ${category.budgeted.toLocaleString()}
                      </p>
                      <Dialog open={isEditing} onOpenChange={(open) => !open && setEditingId(null)}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleEditClick(category.id)}
                            aria-label={`Edit budget for ${category.name}`}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit budget for {category.name}</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="budget" className="text-right">
                                Budget
                              </Label>
                              <Input
                                id="budget"
                                type="number"
                                value={newBudget}
                                onChange={(event) => setNewBudget(Number(event.target.value))}
                                className="col-span-3"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button type="button" onClick={handleSaveBudget}>
                                Save changes
                              </Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  <Progress value={progress} className={isOverBudget ? '[&>div]:bg-destructive' : undefined} />
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
