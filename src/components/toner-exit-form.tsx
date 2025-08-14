'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Toner, TonerExit } from '@/lib/types'
import { mockUsers } from '@/lib/data'

interface TonerExitFormProps {
  toners: Toner[]
  onSubmit: (exit: Omit<TonerExit, 'id' | 'createdAt'>) => void
}

export function TonerExitForm({ toners, onSubmit }: TonerExitFormProps) {
  const [formData, setFormData] = useState({
    tonerId: '',
    quantity: 1,
    exitDate: new Date().toISOString().split('T')[0],
    requestedBy: 'Pedro Costa',
    authorizedBy: 'João Silva',
    department: 'Vendas',
    printerLocation: '',
    reason: 'Substituição de toner vazio',
    notes: ''
  })

  const selectedToner = toners.find(t => t.id === formData.tonerId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.tonerId || !formData.printerLocation) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    if (!selectedToner) {
      toast.error('Selecione um toner válido')
      return
    }

    if (selectedToner.quantity < formData.quantity) {
      toast.error('Quantidade insuficiente em estoque')
      return
    }

    const exit: Omit<TonerExit, 'id' | 'createdAt'> = {
      tonerId: formData.tonerId,
      quantity: Number(formData.quantity),
      exitDate: new Date(formData.exitDate),
      requestedBy: formData.requestedBy,
      authorizedBy: formData.authorizedBy,
      department: formData.department,
      printerLocation: formData.printerLocation,
      reason: formData.reason,
      notes: formData.notes,
    }

    onSubmit(exit)
    toast.success('Saída registrada com sucesso!')
    
    // Reset form
    setFormData({
      tonerId: '',
      quantity: 1,
      exitDate: new Date().toISOString().split('T')[0],
      requestedBy: 'Pedro Costa',
      authorizedBy: 'João Silva',
      department: 'Vendas',
      printerLocation: '',
      reason: 'Substituição de toner vazio',
      notes: ''
    })
  }

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const departments = [
    'Vendas',
    'Administrativo',
    'TI',
    'Financeiro',
    'RH',
    'Marketing',
    'Operações'
  ]

  const reasons = [
    'Substituição de toner vazio',
    'Manutenção preventiva',
    'Troca de impressora',
    'Backup para setor',
    'Instalação nova impressora',
    'Outros'
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Saída de Toners</CardTitle>
        <CardDescription>
          Registre a retirada de toners do estoque
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
                    <div className="flex items-center justify-between w-full">
                      <span>{toner.brand} {toner.model} - {toner.printerModel}</span>
                      <Badge variant={toner.quantity > toner.minStock ? 'default' : 'destructive'}>
                        {toner.quantity} disponível
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedToner && (
              <div className="mt-2 p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{selectedToner.brand} {selectedToner.model}</p>
                    <p className="text-sm text-muted-foreground">
                      Localização: {selectedToner.location}
                    </p>
                  </div>
                  <Badge variant={selectedToner.quantity > selectedToner.minStock ? 'default' : 'destructive'}>
                    {selectedToner.quantity} em estoque
                  </Badge>
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="quantity">Quantidade *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={selectedToner?.quantity || 1}
                value={formData.quantity}
                onChange={(e) => updateField('quantity', Number(e.target.value))}
                required
              />
              {selectedToner && formData.quantity > selectedToner.quantity && (
                <p className="text-sm text-red-500 mt-1">
                  Quantidade maior que o disponível em estoque
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="exitDate">Data de Saída *</Label>
              <Input
                id="exitDate"
                type="date"
                value={formData.exitDate}
                onChange={(e) => updateField('exitDate', e.target.value)}
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
              <Label htmlFor="department">Setor *</Label>
              <Select value={formData.department} onValueChange={(value) => updateField('department', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="printerLocation">Localização da Impressora *</Label>
              <Input
                id="printerLocation"
                value={formData.printerLocation}
                onChange={(e) => updateField('printerLocation', e.target.value)}
                placeholder="Ex: Sala 201, Recepção, etc."
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="reason">Motivo da Retirada *</Label>
            <Select value={formData.reason} onValueChange={(value) => updateField('reason', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {reasons.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

          <Button 
            type="submit" 
            className="w-full"
            disabled={!selectedToner || formData.quantity > selectedToner.quantity}
          >
            Registrar Saída
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
