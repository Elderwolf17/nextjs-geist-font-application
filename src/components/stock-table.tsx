'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Toner } from '@/lib/types'
import { isLowStock } from '@/lib/data'

interface StockTableProps {
  toners: Toner[]
}

export function StockTable({ toners }: StockTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'low' | 'ok'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'quantity' | 'location'>('name')

  const filteredToners = toners
    .filter(toner => {
      const matchesSearch = 
        toner.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        toner.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        toner.printerModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        toner.location.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesFilter = 
        filterStatus === 'all' ||
        (filterStatus === 'low' && isLowStock(toner)) ||
        (filterStatus === 'ok' && !isLowStock(toner))

      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`)
        case 'quantity':
          return b.quantity - a.quantity
        case 'location':
          return a.location.localeCompare(b.location)
        default:
          return 0
      }
    })

  const getColorBadge = (color: string) => {
    const colorMap = {
      black: 'Preto',
      cyan: 'Ciano',
      magenta: 'Magenta',
      yellow: 'Amarelo'
    }
    return colorMap[color as keyof typeof colorMap] || color
  }

  const getStockStatus = (toner: Toner) => {
    if (toner.quantity === 0) {
      return { variant: 'destructive' as const, text: 'Sem estoque' }
    } else if (isLowStock(toner)) {
      return { variant: 'secondary' as const, text: 'Estoque baixo' }
    } else {
      return { variant: 'default' as const, text: 'Estoque OK' }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Controle de Estoque</CardTitle>
        <CardDescription>
          Visualize e gerencie o estoque atual de toners
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Buscar por marca, modelo, impressora ou localização..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={filterStatus} onValueChange={(value: 'all' | 'low' | 'ok') => setFilterStatus(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="low">Estoque baixo</SelectItem>
                <SelectItem value="ok">Estoque OK</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value: 'name' | 'quantity' | 'location') => setSortBy(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nome</SelectItem>
                <SelectItem value="quantity">Quantidade</SelectItem>
                <SelectItem value="location">Localização</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Toner</TableHead>
                <TableHead>Cor</TableHead>
                <TableHead>Impressora</TableHead>
                <TableHead>Código de Barras</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead className="text-center">Quantidade</TableHead>
                <TableHead className="text-center">Mín.</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredToners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nenhum toner encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredToners.map((toner) => {
                  const status = getStockStatus(toner)
                  return (
                    <TableRow key={toner.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{toner.brand} {toner.model}</p>
                          <p className="text-sm text-muted-foreground">
                            Atualizado em {new Date(toner.updatedAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getColorBadge(toner.color)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{toner.printerModel}</p>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {toner.barcode}
                        </code>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{toner.location}</p>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`font-bold ${
                          toner.quantity === 0 ? 'text-red-600' : 
                          isLowStock(toner) ? 'text-orange-600' : 
                          'text-green-600'
                        }`}>
                          {toner.quantity}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-muted-foreground">{toner.minStock}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={status.variant}>
                          {status.text}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          Mostrando {filteredToners.length} de {toners.length} toners
        </div>
      </CardContent>
    </Card>
  )
}
