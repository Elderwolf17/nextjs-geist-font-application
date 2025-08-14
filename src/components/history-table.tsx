'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Toner, TonerEntry, TonerExit } from '@/lib/types'
import { formatDate, formatCurrency } from '@/lib/data'

interface HistoryTableProps {
  entries: TonerEntry[]
  exits: TonerExit[]
  toners: Toner[]
}

export function HistoryTable({ entries, exits, toners }: HistoryTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [userFilter, setUserFilter] = useState('')

  const getToner = (tonerId: string) => {
    return toners.find(t => t.id === tonerId)
  }

  const filteredEntries = entries
    .filter(entry => {
      const toner = getToner(entry.tonerId)
      const matchesSearch = 
        toner?.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        toner?.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.authorizedBy.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesDate = !dateFilter || 
        new Date(entry.entryDate).toISOString().split('T')[0] === dateFilter

      const matchesUser = !userFilter || userFilter === 'all' ||
        entry.requestedBy.includes(userFilter) ||
        entry.authorizedBy.includes(userFilter)

      return matchesSearch && matchesDate && matchesUser
    })
    .sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime())

  const filteredExits = exits
    .filter(exit => {
      const toner = getToner(exit.tonerId)
      const matchesSearch = 
        toner?.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        toner?.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exit.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exit.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exit.authorizedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exit.printerLocation.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesDate = !dateFilter || 
        new Date(exit.exitDate).toISOString().split('T')[0] === dateFilter

      const matchesUser = !userFilter || userFilter === 'all' ||
        exit.requestedBy.includes(userFilter) ||
        exit.authorizedBy.includes(userFilter)

      return matchesSearch && matchesDate && matchesUser
    })
    .sort((a, b) => new Date(b.exitDate).getTime() - new Date(a.exitDate).getTime())

  const allUsers = Array.from(new Set([
    ...entries.map(e => e.requestedBy),
    ...entries.map(e => e.authorizedBy),
    ...exits.map(e => e.requestedBy),
    ...exits.map(e => e.authorizedBy)
  ])).sort()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Movimentações</CardTitle>
        <CardDescription>
          Visualize todas as entradas e saídas de toners
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Buscar por toner, fornecedor, usuário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-40"
            />
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Usuário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {allUsers.map((user) => (
                  <SelectItem key={user} value={user}>
                    {user}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="entries">Entradas ({entries.length})</TabsTrigger>
            <TabsTrigger value="exits">Saídas ({exits.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Toner</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Solicitado por</TableHead>
                    <TableHead>Autorizado por</TableHead>
                    <TableHead>Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    ...filteredEntries.map(entry => ({ ...entry, type: 'entry' as const })),
                    ...filteredExits.map(exit => ({ ...exit, type: 'exit' as const }))
                  ]
                    .sort((a, b) => {
                      const dateA = a.type === 'entry' ? new Date(a.entryDate) : new Date(a.exitDate)
                      const dateB = b.type === 'entry' ? new Date(b.entryDate) : new Date(b.exitDate)
                      return dateB.getTime() - dateA.getTime()
                    })
                    .slice(0, 50)
                    .map((movement, index) => {
                      const toner = getToner(movement.tonerId)
                      const isEntry = movement.type === 'entry'
                      
                      return (
                        <TableRow key={`${movement.type}-${movement.id}`}>
                          <TableCell>
                            <Badge variant={isEntry ? 'default' : 'secondary'}>
                              {isEntry ? 'Entrada' : 'Saída'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{toner?.brand} {toner?.model}</p>
                              <p className="text-sm text-muted-foreground">{toner?.printerModel}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`font-bold ${isEntry ? 'text-green-600' : 'text-red-600'}`}>
                              {isEntry ? '+' : '-'}{movement.quantity}
                            </span>
                          </TableCell>
                          <TableCell>
                            {formatDate(isEntry ? movement.entryDate : movement.exitDate)}
                          </TableCell>
                          <TableCell>{movement.requestedBy}</TableCell>
                          <TableCell>{movement.authorizedBy}</TableCell>
                          <TableCell>
                            {isEntry ? (
                              <div className="text-sm">
                                <p>Fornecedor: {movement.supplier}</p>
                                <p>Valor: {formatCurrency(movement.totalPrice)}</p>
                              </div>
                            ) : (
                              <div className="text-sm">
                                <p>Setor: {movement.department}</p>
                                <p>Local: {movement.printerLocation}</p>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="entries">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Toner</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Data Entrada</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead>Solicitado por</TableHead>
                    <TableHead>Autorizado por</TableHead>
                    <TableHead>NF</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry) => {
                    const toner = getToner(entry.tonerId)
                    return (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{toner?.brand} {toner?.model}</p>
                            <p className="text-sm text-muted-foreground">{toner?.printerModel}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-green-600">+{entry.quantity}</span>
                        </TableCell>
                        <TableCell>{formatDate(entry.entryDate)}</TableCell>
                        <TableCell>{entry.supplier}</TableCell>
                        <TableCell>{formatCurrency(entry.totalPrice)}</TableCell>
                        <TableCell>{entry.requestedBy}</TableCell>
                        <TableCell>{entry.authorizedBy}</TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {entry.invoiceNumber || 'N/A'}
                          </code>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="exits">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Toner</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Data Saída</TableHead>
                    <TableHead>Setor</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Solicitado por</TableHead>
                    <TableHead>Autorizado por</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExits.map((exit) => {
                    const toner = getToner(exit.tonerId)
                    return (
                      <TableRow key={exit.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{toner?.brand} {toner?.model}</p>
                            <p className="text-sm text-muted-foreground">{toner?.printerModel}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-red-600">-{exit.quantity}</span>
                        </TableCell>
                        <TableCell>{formatDate(exit.exitDate)}</TableCell>
                        <TableCell>{exit.department}</TableCell>
                        <TableCell>{exit.printerLocation}</TableCell>
                        <TableCell>
                          <span className="text-sm">{exit.reason}</span>
                        </TableCell>
                        <TableCell>{exit.requestedBy}</TableCell>
                        <TableCell>{exit.authorizedBy}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-4 text-sm text-muted-foreground">
          Total: {entries.length} entradas, {exits.length} saídas
        </div>
      </CardContent>
    </Card>
  )
}
