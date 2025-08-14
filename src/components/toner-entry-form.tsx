'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Toner, TonerEntry } from '@/lib/types'
import { mockUsers } from '@/lib/data'

interface TonerEntryFormProps {
  toners: Toner[]
  onSubmit: (entry: Omit<TonerEntry, 'id' | 'createdAt'>) => void
}

export function TonerEntryForm({ toners, onSubmit }: TonerEntryFormProps) {
  const [formData, setFormData] = useState({
    tonerId: '',
    quantity: 1,
    purchaseDate: new Date().toISOString().split('T')[0],
    entryDate: new Date().toISOString().split('T')[0],
    requestedBy: 'João Silva',
    authorizedBy: 'Maria Santos',
    supplier: '',
    unitPrice: 0,
    invoiceNumber: '',
    notes: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.tonerId || !formData.supplier) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    const entry: Omit<TonerEntry, 'id' | 'createdAt'> = {
      tonerId: formData.tonerId,
      quantity: Number(formData.quantity),
      purchaseDate: new Date(formData.purchaseDate),
      entryDate: new Date(formData.entryDate),
      requestedBy: formData.requestedBy,
      authorizedBy: formData.authorizedBy,
      supplier: formData.supplier,
      unitPrice: Number(formData.unitPrice),
      totalPrice: Number(formData.quantity) * Number(formData.unitPrice),
      invoiceNumber: formData.invoiceNumber,
      notes: formData.notes,
    }

    onSubmit(entry)
    toast.success('Entrada registrada com sucesso!')
    
    // Reset form
    setFormData({
      tonerId: '',
      quantity: 1,
      purchaseDate: new Date().toISOString().split('T')[0],
      entryDate: new Date().toISOString().split('T')[0],
      requestedBy: 'João Silva',
      authorizedBy: 'Maria Santos',
      supplier: '',
      unitPrice: 0,
      invoiceNumber: '',
      notes: ''
    })
  }

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Entrada de Toners</CardTitle>
        <CardDescription>
          Registre a entrada de toners no estoque
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="tonerId">Toner *</Label>
            <Select value={formData.tonerId} onValueChange={(value) => updateField('tonerId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um toner" />
              </SelectTrigger>
              <SelectContent>
                {toners.map((toner) => (
                  <SelectItem key={toner.id} value={toner.id}>
                    {toner.brand} {toner.model} - {toner.printerModel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="quantity">Quantidade *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => updateField('quantity', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="unitPrice">Preço Unitário (R$) *</Label>
              <Input
                id="unitPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.unitPrice}
                onChange={(e) => updateField('unitPrice', e.target.value)}
                required
              />
            </div>
          </div>

          {formData.quantity && formData.unitPrice && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">
                Total: R$ {(Number(formData.quantity) * Number(formData.unitPrice)).toFixed(2)}
              </p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="purchaseDate">Data da Compra *</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => updateField('purchaseDate', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="entryDate">Data de Entrada *</Label>
              <Input
                id="entryDate"
                type="date"
                value={formData.entryDate}
                onChange={(e) => updateField('entryDate', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="requestedBy">Solicitado por *</Label>
              <Select value={formData.requestedBy} onValueChange={(value) => updateField('requestedBy', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockUsers.map((user) => (
                    <SelectItem key={user.id} value={user.name}>
                      {user.name} - {user.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="authorizedBy">Autorizado por *</Label>
              <Select value={formData.authorizedBy} onValueChange={(value) => updateField('authorizedBy', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockUsers.filter(user => user.canAuthorize).map((user) => (
                    <SelectItem key={user.id} value={user.name}>
                      {user.name} - {user.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="supplier">Fornecedor *</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => updateField('supplier', e.target.value)}
                placeholder="Nome do fornecedor"
                required
              />
            </div>
            <div>
              <Label htmlFor="invoiceNumber">Número da Nota Fiscal</Label>
              <Input
                id="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={(e) => updateField('invoiceNumber', e.target.value)}
                placeholder="NF-123456"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Observações adicionais..."
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full">
            Registrar Entrada
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
