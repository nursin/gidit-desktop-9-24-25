import { useRef, useState } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'
import {
  Banknote,
  CreditCard,
  FileArchive,
  FileQuestion,
  FileText,
  Heart,
  Loader2,
  Pill,
  Plus,
  Printer,
  Trash2,
  Upload,
} from 'lucide-react'

type DocumentDetails = {
  title: string
  documentType: string
  date?: string
  totalAmount?: number | null
  summary?: string
  fullText?: string
  statementDetails?: {
    accountNumber?: string
    statementPeriod?: string
    openingBalance?: number
    closingBalance?: number
    transactions?: Array<{ date: string; description: string; amount: number }>
  }
  pharmacyDetails?: {
    pharmacy?: string
    fillDate?: string
    rxNumber?: string
    medication?: string
    dosage?: string
    quantity?: number
    prescribingDoctor?: string
  }
}

type ReceiptData = {
  store: { name: string; address: string; phone: string }
  transaction: { date: string; time: string }
  items: Array<{ description: string; quantity: number; price_per_unit?: number; total_price: number }>
  totals: { subtotal?: number; taxes?: number; total?: number }
  payment: { type: string; card_last_four?: string }
}

type GenerateHealthSummaryOutput = {
  comprehensiveSummary: string
}

type DocumentRecord = {
  id: string
  fileName: string
  dataUri: string
  uploadedAt: Date
  classification?: DocumentDetails
  details?: ReceiptData | GenerateHealthSummaryOutput | DocumentDetails
  status: 'classifying' | 'extracting' | 'complete' | 'error'
}

const createId = () => crypto.randomUUID()
const clone = <T,>(value: T): T =>
  value === undefined ? value : JSON.parse(JSON.stringify(value))

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const mockClassify = async (fileName: string): Promise<DocumentDetails> => {
  await delay(600)
  const lower = fileName.toLowerCase()
  if (lower.includes('receipt')) {
    return {
      title: 'Sample Grocery Receipt',
      documentType: 'Receipt',
      date: new Date().toLocaleDateString(),
      totalAmount: 54.38,
      summary: 'Groceries and household items purchased.',
      fullText: 'STORE NAME\nItem A $10\nItem B $20\nTaxes $4.38',
    }
  }
  if (lower.includes('statement') || lower.includes('bank')) {
    return {
      title: 'Checking Account Statement',
      documentType: 'Bank Statement',
      date: new Date().toLocaleDateString(),
      statementDetails: {
        accountNumber: '****4321',
        statementPeriod: 'Jan 1 - Jan 31',
        openingBalance: 1250,
        closingBalance: 1784.56,
        transactions: [
          { date: 'Jan 02', description: 'Deposit', amount: 500 },
          { date: 'Jan 05', description: 'Coffee Shop', amount: -12.5 },
          { date: 'Jan 13', description: 'Utilities', amount: -90.2 },
        ],
      },
    }
  }
  if (lower.includes('pharmacy')) {
    return {
      title: 'Prescription Pickup',
      documentType: 'Pharmacy Record',
      date: new Date().toLocaleDateString(),
      pharmacyDetails: {
        pharmacy: 'Community Pharmacy',
        fillDate: new Date().toLocaleDateString(),
        rxNumber: 'RX-20498',
        medication: 'Lisinopril 20mg',
        dosage: 'Take one tablet daily',
        quantity: 30,
        prescribingDoctor: 'Dr. Patel',
      },
      fullText: 'Prescription for Lisinopril 20mg, take one tablet daily.',
    }
  }
  if (lower.includes('health') || lower.includes('medical')) {
    return {
      title: 'Annual Physical Summary',
      documentType: 'Health Summary',
      date: new Date().toLocaleDateString(),
      summary: 'Patient in good health with minor recommendations for exercise.',
      fullText: 'Vitals within normal range. Suggest increased cardio activity.',
    }
  }
  return {
    title: fileName,
    documentType: 'Document',
    date: new Date().toLocaleDateString(),
    summary: 'Generic document summary placeholder.',
    fullText: 'Full text was not extracted.',
  }
}

const mockReceiptExtraction = async (): Promise<ReceiptData> => {
  await delay(700)
  return {
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
      { description: 'Organic Apples', quantity: 4, price_per_unit: 1.5, total_price: 6 },
      { description: 'Almond Milk', quantity: 2, price_per_unit: 3.99, total_price: 7.98 },
      { description: 'Granola Bars', quantity: 1, price_per_unit: 4.5, total_price: 4.5 },
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
}

const mockHealthSummary = async (): Promise<GenerateHealthSummaryOutput> => {
  await delay(700)
  return {
    comprehensiveSummary: `Chief Complaint: Routine wellness visit.\n\nAssessment:\n- Healthy adult with stable vitals.\n- Recommend continuing current medications.\n\nPlan:\n- Increase weekly exercise to 150 minutes.\n- Follow-up in six months for lab work.`,
  }
}

const EditableField = ({
  value,
  onChange,
  className,
  as = 'input',
  type = 'text',
}: {
  value: string | number | null | undefined
  onChange: (value: string) => void
  className?: string
  as?: 'input' | 'textarea'
  type?: string
}) => {
  const Component = as === 'textarea' ? Textarea : Input
  return (
    <Component
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value)}
      className={cn(
        'h-auto w-full -m-0.5 bg-transparent p-0.5 text-sm focus-visible:ring-1 focus-visible:ring-primary',
        as === 'textarea' && 'resize-none',
        className,
      )}
      {...(as === 'input' ? { type } : {})}
    />
  )
}

const ReceiptDisplay = ({ data, onUpdate }: { data: ReceiptData; onUpdate: (updated: ReceiptData) => void }) => {
  const handleFieldChange = (path: string, value: string | number) => {
    const keys = path.split('.')
    const next = clone(data)
    let pointer: any = next
    for (let i = 0; i < keys.length - 1; i++) {
      pointer = pointer[keys[i]]
    }
    pointer[keys[keys.length - 1]] = value
    onUpdate(next)
  }

  const handleItemChange = (index: number, field: keyof ReceiptData['items'][number], value: string | number) => {
    const next = clone(data)
    const item = next.items[index]
    if (!item) return
    ;(item as any)[field] = value
    if (field === 'quantity' || field === 'price_per_unit') {
      item.total_price = (Number(item.quantity) || 0) * (Number(item.price_per_unit) || 0)
    }
    onUpdate(next)
  }

  const handleAddItem = () => {
    const next = clone(data)
    next.items.push({ description: 'New Item', quantity: 1, price_per_unit: 0, total_price: 0 })
    onUpdate(next)
  }

  return (
    <div className="rounded-none border border-border bg-background/50 p-4 text-sm">
      <div className="mb-4 text-center">
        <EditableField
          value={data.store.name}
          onChange={(value) => handleFieldChange('store.name', value)}
          className="text-lg font-semibold"
        />
        <EditableField
          value={data.store.address}
          onChange={(value) => handleFieldChange('store.address', value)}
          className="text-xs text-muted-foreground"
        />
        <EditableField
          value={data.store.phone}
          onChange={(value) => handleFieldChange('store.phone', value)}
          className="text-xs text-muted-foreground"
        />
      </div>
      <div className="mb-2 flex justify-between text-xs text-muted-foreground">
        <EditableField value={data.transaction.date} onChange={(value) => handleFieldChange('transaction.date', value)} />
        <EditableField value={data.transaction.time} onChange={(value) => handleFieldChange('transaction.time', value)} />
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
          {data.items.map((item, index) => (
            <TableRow key={index}>
              <TableCell>
                <EditableField
                  value={item.description}
                  onChange={(value) => handleItemChange(index, 'description', value)}
                />
              </TableCell>
              <TableCell className="text-center">
                <EditableField
                  value={item.quantity}
                  onChange={(value) => handleItemChange(index, 'quantity', Number(value))}
                  type="number"
                />
              </TableCell>
              <TableCell className="text-right">
                <EditableField
                  value={item.total_price?.toFixed(2)}
                  onChange={(value) => handleItemChange(index, 'total_price', Number(value))}
                  type="number"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>
              <Button variant="ghost" size="sm" className="w-full justify-start text-xs" onClick={handleAddItem}>
                <Plus className="mr-2 h-3 w-3" /> Add Item
              </Button>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={2} className="text-right font-semibold">
              Subtotal
            </TableCell>
            <TableCell className="text-right font-semibold">
              <EditableField
                value={data.totals.subtotal?.toFixed(2)}
                onChange={(value) => handleFieldChange('totals.subtotal', Number(value))}
                type="number"
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={2} className="text-right font-semibold">
              Taxes
            </TableCell>
            <TableCell className="text-right font-semibold">
              <EditableField
                value={data.totals.taxes?.toFixed(2)}
                onChange={(value) => handleFieldChange('totals.taxes', Number(value))}
                type="number"
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={2} className="text-right font-bold">
              Total
            </TableCell>
            <TableCell className="text-right font-bold">
              <EditableField
                value={data.totals.total?.toFixed(2)}
                onChange={(value) => handleFieldChange('totals.total', Number(value))}
                type="number"
              />
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      <div className="mt-4 text-center text-xs text-muted-foreground">
        <EditableField value={`Paid with ${data.payment.type}`} onChange={() => {}} className="text-center" />
      </div>
    </div>
  )
}

const HealthSummaryDisplay = ({
  data,
  onUpdate,
}: {
  data: GenerateHealthSummaryOutput
  onUpdate: (next: GenerateHealthSummaryOutput) => void
}) => (
  <div className="rounded-none border border-border bg-background/50 p-4">
    <h3 className="mb-2 text-sm font-semibold">Comprehensive Summary</h3>
    <Textarea
      value={data.comprehensiveSummary}
      onChange={(event) => onUpdate({ comprehensiveSummary: event.target.value })}
      className="h-64 w-full resize-none bg-transparent text-sm focus-visible:ring-0"
    />
  </div>
)

const BankStatementDisplay = ({ data, onUpdate }: { data: DocumentDetails; onUpdate: (next: DocumentDetails) => void }) => {
  const details = data.statementDetails
  if (!details) return <DefaultDisplay data={data} onUpdate={onUpdate} />

  const handleFieldChange = (path: string, value: string | number) => {
    const keys = path.split('.')
    const next = clone(data)
    let pointer: any = next
    for (let i = 0; i < keys.length - 1; i++) {
      pointer = pointer[keys[i]]
    }
    pointer[keys[keys.length - 1]] = value
    onUpdate(next)
  }

  const handleTransactionChange = (
    index: number,
    field: keyof NonNullable<typeof details.transactions>[number],
    value: string | number,
  ) => {
    if (!details.transactions) return
    const next = clone(details.transactions)
    next[index] = { ...next[index], [field]: value }
    handleFieldChange('statementDetails.transactions', next)
  }

  const handleAddTransaction = () => {
    const next = clone(details.transactions ?? [])
    next.push({ date: new Date().toLocaleDateString(), description: 'New transaction', amount: 0 })
    handleFieldChange('statementDetails.transactions', next)
  }

  return (
    <div className="space-y-4 rounded-none border border-border bg-background/50 p-4 text-sm">
      <div className="flex items-start justify-between border-b pb-2">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <EditableField value={data.title} onChange={(value) => handleFieldChange('title', value)} className="text-lg font-semibold" />
          </div>
          <EditableField
            value={`Account: ${details.accountNumber ?? 'N/A'}`}
            onChange={(value) => handleFieldChange('statementDetails.accountNumber', value.replace('Account: ', ''))}
            className="text-xs text-muted-foreground"
          />
          <EditableField
            value={`Period: ${details.statementPeriod ?? data.date ?? 'N/A'}`}
            onChange={(value) => handleFieldChange('statementDetails.statementPeriod', value.replace('Period: ', ''))}
            className="text-xs text-muted-foreground"
          />
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Closing Balance</p>
          <EditableField
            value={details.closingBalance?.toFixed(2)}
            onChange={(value) => handleFieldChange('statementDetails.closingBalance', Number(value))}
            type="number"
            className="text-right text-xl font-bold text-primary"
          />
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {details.transactions?.map((transaction, index) => (
            <TableRow key={index}>
              <TableCell>
                <EditableField
                  value={transaction.date}
                  onChange={(value) => handleTransactionChange(index, 'date', value)}
                />
              </TableCell>
              <TableCell className="font-medium">
                <EditableField
                  value={transaction.description}
                  onChange={(value) => handleTransactionChange(index, 'description', value)}
                />
              </TableCell>
              <TableCell className={cn('text-right font-mono', transaction.amount > 0 ? 'text-green-600' : undefined)}>
                <EditableField
                  value={transaction.amount}
                  onChange={(value) => handleTransactionChange(index, 'amount', Number(value))}
                  type="number"
                  className="text-right"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>
              <Button variant="ghost" size="sm" className="w-full justify-start text-xs" onClick={handleAddTransaction}>
                <Plus className="mr-2 h-3 w-3" /> Add Transaction
              </Button>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={2} className="text-right font-semibold">
              Opening Balance
            </TableCell>
            <TableCell className="text-right font-semibold">
              <EditableField
                value={details.openingBalance?.toFixed(2)}
                onChange={(value) => handleFieldChange('statementDetails.openingBalance', Number(value))}
                type="number"
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={2} className="text-right font-bold">
              Closing Balance
            </TableCell>
            <TableCell className="text-right font-bold">
              <EditableField
                value={details.closingBalance?.toFixed(2)}
                onChange={(value) => handleFieldChange('statementDetails.closingBalance', Number(value))}
                type="number"
              />
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}

const PharmacyRecordDisplay = ({ data, onUpdate }: { data: DocumentDetails; onUpdate: (next: DocumentDetails) => void }) => {
  const details = data.pharmacyDetails
  if (!details) return <DefaultDisplay data={data} onUpdate={onUpdate} />

  const handleFieldChange = (path: string, value: string | number) => {
    const keys = path.split('.')
    const next = clone(data)
    let pointer: any = next
    for (let i = 0; i < keys.length - 1; i++) {
      pointer = pointer[keys[i]]
    }
    pointer[keys[keys.length - 1]] = value
    onUpdate(next)
  }

  return (
    <div className="space-y-4 rounded-none border border-border bg-background/50 p-4 text-sm">
      <div className="flex items-start justify-between border-b pb-2">
        <div>
          <div className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-primary" />
            <EditableField
              value={details.pharmacy}
              onChange={(value) => handleFieldChange('pharmacyDetails.pharmacy', value)}
              className="text-lg font-semibold"
            />
          </div>
          <EditableField
            value={`Fill Date: ${details.fillDate ?? data.date ?? 'N/A'}`}
            onChange={(value) => handleFieldChange('pharmacyDetails.fillDate', value.replace('Fill Date: ', ''))}
            className="text-xs text-muted-foreground"
          />
        </div>
        {details.rxNumber ? (
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Rx Number</p>
            <EditableField
              value={details.rxNumber}
              onChange={(value) => handleFieldChange('pharmacyDetails.rxNumber', value)}
              className="font-mono text-lg font-semibold"
            />
          </div>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Medication</p>
          <EditableField
            value={details.medication}
            onChange={(value) => handleFieldChange('pharmacyDetails.medication', value)}
            className="font-medium"
          />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Quantity</p>
          <EditableField
            value={details.quantity}
            onChange={(value) => handleFieldChange('pharmacyDetails.quantity', Number(value))}
            type="number"
            className="font-medium"
          />
        </div>
        <div className="col-span-2">
          <p className="text-xs text-muted-foreground">Dosage</p>
          <EditableField
            value={details.dosage}
            onChange={(value) => handleFieldChange('pharmacyDetails.dosage', value)}
            className="font-medium"
          />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Prescribing Doctor</p>
          <EditableField
            value={details.prescribingDoctor}
            onChange={(value) => handleFieldChange('pharmacyDetails.prescribingDoctor', value)}
            className="font-medium"
          />
        </div>
      </div>
      {data.fullText ? (
        <div>
          <h6 className="mb-1 text-xs font-semibold">Full Text</h6>
          <Textarea
            value={data.fullText}
            onChange={(event) => handleFieldChange('fullText', event.target.value)}
            className="h-40 w-full resize-none bg-secondary text-xs"
          />
        </div>
      ) : null}
    </div>
  )
}

const GenericFinancialDisplay = ({ data, onUpdate }: { data: DocumentDetails; onUpdate: (next: DocumentDetails) => void }) => {
  const handleFieldChange = (path: string, value: string | number) => {
    const keys = path.split('.')
    const next = clone(data)
    let pointer: any = next
    for (let i = 0; i < keys.length - 1; i++) {
      pointer = pointer[keys[i]]
    }
    pointer[keys[keys.length - 1]] = value
    onUpdate(next)
  }

  return (
    <Card className="rounded-none border border-border bg-background/50">
      <CardHeader className="space-y-1 p-4">
        <div className="flex items-center gap-2">
          <Banknote className="h-5 w-5 text-primary" />
          <EditableField value={data.title} onChange={(value) => handleFieldChange('title', value)} className="text-lg font-semibold" />
        </div>
        <EditableField
          value={`Date: ${data.date ?? 'N/A'}`}
          onChange={(value) => handleFieldChange('date', value.replace('Date: ', ''))}
          className="text-xs text-muted-foreground"
        />
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        {data.totalAmount != null ? (
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total Amount</p>
            <EditableField
              value={data.totalAmount?.toFixed(2)}
              onChange={(value) => handleFieldChange('totalAmount', Number(value))}
              type="number"
              className="text-right text-2xl font-bold text-primary"
            />
          </div>
        ) : null}
        <div>
          <h6 className="mb-1 text-xs font-semibold">Summary</h6>
          <EditableField as="textarea" value={data.summary} onChange={(value) => handleFieldChange('summary', value)} />
        </div>
        {data.fullText ? (
          <div>
            <h6 className="mb-1 text-xs font-semibold">Full Text</h6>
            <Textarea
              value={data.fullText}
              onChange={(event) => handleFieldChange('fullText', event.target.value)}
              className="h-40 w-full resize-none bg-secondary text-xs"
            />
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

const GenericHealthDisplay = ({ data, onUpdate }: { data: DocumentDetails; onUpdate: (next: DocumentDetails) => void }) => {
  const handleFieldChange = (path: string, value: string | number) => {
    const keys = path.split('.')
    const next = clone(data)
    let pointer: any = next
    for (let i = 0; i < keys.length - 1; i++) {
      pointer = pointer[keys[i]]
    }
    pointer[keys[keys.length - 1]] = value
    onUpdate(next)
  }

  return (
    <Card className="rounded-none border border-border bg-background/50">
      <CardHeader className="space-y-1 p-4">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          <EditableField value={data.title} onChange={(value) => handleFieldChange('title', value)} className="text-lg font-semibold" />
        </div>
        <EditableField
          value={`Date: ${data.date ?? 'N/A'}`}
          onChange={(value) => handleFieldChange('date', value.replace('Date: ', ''))}
          className="text-xs text-muted-foreground"
        />
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        <div>
          <h6 className="mb-1 text-xs font-semibold">Summary</h6>
          <EditableField as="textarea" value={data.summary} onChange={(value) => handleFieldChange('summary', value)} />
        </div>
        {data.fullText ? (
          <div>
            <h6 className="mb-1 text-xs font-semibold">Full Text</h6>
            <Textarea
              value={data.fullText}
              onChange={(event) => handleFieldChange('fullText', event.target.value)}
              className="h-40 w-full resize-none bg-secondary text-xs"
            />
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

const DefaultDisplay = ({ data, onUpdate }: { data: DocumentDetails; onUpdate: (next: DocumentDetails) => void }) => {
  const handleFieldChange = (path: string, value: string | number) => {
    const keys = path.split('.')
    const next = clone(data)
    let pointer: any = next
    for (let i = 0; i < keys.length - 1; i++) {
      pointer = pointer[keys[i]]
    }
    pointer[keys[keys.length - 1]] = value
    onUpdate(next)
  }

  return (
    <Card className="rounded-none border border-border bg-background/50">
      <CardHeader className="space-y-1 p-4">
        <div className="flex items-center gap-2">
          <FileQuestion className="h-5 w-5 text-primary" />
          <EditableField value={data.title} onChange={(value) => handleFieldChange('title', value)} className="text-lg font-semibold" />
        </div>
        <EditableField
          value={`Type: ${data.documentType} | Date: ${data.date ?? 'N/A'}`}
          onChange={() => {}}
          className="text-xs text-muted-foreground"
        />
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        <div>
          <h6 className="mb-1 text-xs font-semibold">Summary</h6>
          <EditableField as="textarea" value={data.summary} onChange={(value) => handleFieldChange('summary', value)} />
        </div>
        {data.fullText ? (
          <div>
            <h6 className="mb-1 text-xs font-semibold">Full Text</h6>
            <Textarea
              value={data.fullText}
              onChange={(event) => handleFieldChange('fullText', event.target.value)}
              className="h-40 w-full resize-none bg-secondary text-xs"
            />
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

const renderDetails = (
  record: DocumentRecord,
  onUpdate: (recordId: string, details: ReceiptData | GenerateHealthSummaryOutput | DocumentDetails) => void,
) => {
  if (record.status !== 'complete' || !record.details) return null
  const docType = record.classification?.documentType.toLowerCase() ?? ''
  if (docType.includes('receipt'))
    return <ReceiptDisplay data={record.details as ReceiptData} onUpdate={(value) => onUpdate(record.id, value)} />
  if (docType.includes('health') && 'comprehensiveSummary' in record.details)
    return <HealthSummaryDisplay data={record.details as GenerateHealthSummaryOutput} onUpdate={(value) => onUpdate(record.id, value)} />
  if (docType.includes('statement'))
    return <BankStatementDisplay data={record.details as DocumentDetails} onUpdate={(value) => onUpdate(record.id, value)} />
  if (docType.includes('pharmacy'))
    return <PharmacyRecordDisplay data={record.details as DocumentDetails} onUpdate={(value) => onUpdate(record.id, value)} />
  if (docType.includes('financial') || docType.includes('invoice') || docType.includes('paystub'))
    return <GenericFinancialDisplay data={record.details as DocumentDetails} onUpdate={(value) => onUpdate(record.id, value)} />
  if (docType.includes('health'))
    return <GenericHealthDisplay data={record.details as DocumentDetails} onUpdate={(value) => onUpdate(record.id, value)} />
  return <DefaultDisplay data={record.details as DocumentDetails} onUpdate={(value) => onUpdate(record.id, value)} />
}

export default function DocumentRecords({ name = 'Document Records' }: { name?: string }) {
  const [records, setRecords] = useState<DocumentRecord[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const printIframeRef = useRef<HTMLIFrameElement>(null)
  const { toast } = useToast()

  const processRecord = async (record: DocumentRecord) => {
    try {
      const classification = await mockClassify(record.fileName)
      setRecords((current) =>
        current.map((item) => (item.id === record.id ? { ...item, status: 'extracting', classification } : item)),
      )

      const type = classification.documentType.toLowerCase()
      let details: ReceiptData | GenerateHealthSummaryOutput | DocumentDetails = classification
      if (type.includes('receipt')) {
        details = await mockReceiptExtraction()
      } else if (type.includes('health')) {
        details = await mockHealthSummary()
      }

      setRecords((current) =>
        current.map((item) => (item.id === record.id ? { ...item, status: 'complete', details } : item)),
      )
    } catch (error) {
      console.error(error)
      setRecords((current) =>
        current.map((item) => (item.id === record.id ? { ...item, status: 'error' } : item)),
      )
      toast({ title: 'Processing failed', description: 'Could not extract details from the document.', variant: 'destructive' })
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      const dataUri = reader.result as string
      const record: DocumentRecord = {
        id: createId(),
        fileName: file.name,
        dataUri,
        uploadedAt: new Date(),
        status: 'classifying',
      }
      setRecords((current) => [record, ...current])
      processRecord(record)
    }
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleDelete = (recordId: string) => {
    setRecords((current) => current.filter((item) => item.id !== recordId))
    toast({ title: 'Document deleted' })
  }

  const handleUpdateDetails = (
    recordId: string,
    details: ReceiptData | GenerateHealthSummaryOutput | DocumentDetails,
  ) => {
    setRecords((current) => current.map((item) => (item.id === recordId ? { ...item, details } : item)))
  }

  const handlePrintOriginal = (record: DocumentRecord) => {
    const win = window.open('', '_blank')
    if (!win) return
    const isPdf = record.dataUri.startsWith('data:application/pdf')
    win.document.write('<html><head><title>Print Document</title></head><body style="margin:0;">')
    if (isPdf) {
      win.document.write(`<iframe src="${record.dataUri}" style="width:100%;height:100%;border:none;" onload="this.contentWindow.print();"></iframe>`)
    } else {
      win.document.write(`<img src="${record.dataUri}" style="max-width:100%;" onload="window.print();" />`)
    }
    win.document.write('</body></html>')
    win.document.close()
  }

  const handlePrintFormatted = (recordId: string) => {
    const content = document.getElementById(`printable-${recordId}`)
    const iframe = printIframeRef.current
    if (!content || !iframe?.contentWindow) return

    const doc = iframe.contentWindow.document
    doc.open()
    doc.write('<html><head><title>Print</title></head><body class="bg-background text-foreground">')
    doc.write(content.innerHTML)
    doc.write('</body></html>')
    doc.close()
    iframe.onload = () => {
      iframe.contentWindow?.focus()
      iframe.contentWindow?.print()
    }
  }

  return (
    <>
      <iframe ref={printIframeRef} title="print-frame" style={{ display: 'none' }} />
      <Card className="flex h-full flex-col border-0 bg-transparent shadow-none rounded-none">
        <CardHeader>
          <div className="flex items-center gap-3">
            <FileArchive className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>{name}</CardTitle>
              <CardDescription>Your external brain storage.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col">
          <div className="px-6">
            <Input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
            />
            <Button className="w-full" onClick={handleUploadClick}>
              <Upload className="mr-2 h-4 w-4" /> Upload Document
            </Button>
          </div>
          <ScrollArea className="-mx-6 mt-4 flex-1">
            <div className="px-6">
              {records.length === 0 ? (
                <div className="pt-12 text-center text-muted-foreground">
                  <FileText className="mx-auto mb-2 h-12 w-12" />
                  <p>No documents uploaded yet.</p>
                  <p className="text-xs">Upload an image or PDF to classify and extract its contents.</p>
                </div>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {records.map((record) => (
                    <AccordionItem
                      key={record.id}
                      value={record.id}
                      className="mb-2 border border-border bg-background/50"
                    >
                      <AccordionTrigger className="p-3 text-sm hover:no-underline">
                        <div className="flex flex-1 items-center gap-4">
                          {record.status === 'classifying' || record.status === 'extracting' ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Badge variant="outline">{record.classification?.documentType ?? 'Document'}</Badge>
                          )}
                          <div className="flex-1 truncate">
                            <p className="font-semibold">{record.classification?.title ?? record.fileName}</p>
                            <p className="text-xs text-muted-foreground">
                              {record.classification?.date ?? record.uploadedAt.toLocaleDateString()}
                            </p>
                          </div>
                          {record.classification?.totalAmount != null ? (
                            <div className="text-right">
                              <p className="font-bold text-primary">
                                ${record.classification.totalAmount.toFixed(2)}
                              </p>
                              <p className="text-xs text-muted-foreground">Total</p>
                            </div>
                          ) : null}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-3 pb-3">
                        {record.status === 'complete' ? (
                          <div>
                            <div id={`printable-${record.id}`}>{renderDetails(record, handleUpdateDetails)}</div>
                            <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => handlePrintOriginal(record)}>
                                <Printer className="mr-2 h-4 w-4" /> Print Original
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handlePrintFormatted(record.id)}>
                                <Printer className="mr-2 h-4 w-4" /> Print Formatted
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <FileText className="mr-2 h-4 w-4" /> View Full Text
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[600px]">
                                  <DialogHeader>
                                    <DialogTitle>Full Extracted Text</DialogTitle>
                                    <DialogDescription>
                                      Raw text extracted during processing.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <ScrollArea className="max-h-[60vh] rounded border p-4">
                                    <pre className="whitespace-pre-wrap text-xs font-sans">
                                      {record.classification?.fullText ?? 'No additional text extracted.'}
                                    </pre>
                                  </ScrollArea>
                                </DialogContent>
                              </Dialog>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm">
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete this document?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. The document record will be removed permanently.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(record.id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                            <p className="mt-3 border-t pt-2 text-xs text-muted-foreground">
                              Original filename: {record.fileName}
                            </p>
                          </div>
                        ) : record.status === 'error' ? (
                          <p className="rounded border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                            Could not process document.
                          </p>
                        ) : (
                          <div className="flex items-center gap-2 p-4 text-sm">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Processing... Current step: {record.status}
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </>
  )
}
