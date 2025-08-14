'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  mockToners, 
  mockEntries, 
  mockExits, 
  loadFromStorage, 
  saveToStorage,
  formatCurrency,
  formatDate,
  isLowStock,
  calculateTotalValue
} from '@/lib/data'
import { Toner, TonerEntry, TonerExit } from '@/lib/types'
import { TonerEntryForm } from './toner-entry-form'
import { TonerExitForm } from './toner-exit-form'
import { StockTable } from './stock-table'
import { HistoryTable } from './history-table'

export function Dashboard() {
  const [toners, setToners] = useState<Toner[]>([])
  const [entries, setEntries] = useState<TonerEntry[]>([])
  const [exits, setExits] = useState<TonerExit[]>([])
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => {
    // Carregar dados do localStorage ou usar dados mock
    const storedToners = loadFromStorage('toners', mockToners)
    const storedEntries = loadFromStorage('entries', mockEntries)
    const storedExits = loadFromStorage('exits', mockExits)

    setToners(storedToners)
    setEntries(storedEntries)
    setExits(storedExits)
  }, [])

  const lowStockItems = toners.filter(isLowStock)
  const totalValue = calculateTotalValue(toners, entries)
  const totalItems = toners.reduce((sum, toner) => sum + toner.quantity, 0)

  const handleTonerEntry = (entry: Omit<TonerEntry, 'id' | 'createdAt'>) => {
    const newEntry: TonerEntry = {
      ...entry,
      id: Date.now().toString(),
      createdAt: new Date(),
    }

    const updatedEntries = [...entries, newEntry]
    const updatedToners = toners.map(toner => 
      toner.id === entry.tonerId 
        ? { ...toner, quantity: toner.quantity + entry.quantity, updatedAt: new Date() }
        : toner
    )

    setEntries(updatedEntries)
    setToners(updatedToners)
    saveToStorage('entries', updatedEntries)
    saveToStorage('toners', updatedToners)
  }

  const handleTonerExit = (exit: Omit<TonerExit, 'id' | 'createdAt'>) => {
    const toner = toners.find(t => t.id === exit.tonerId)
    if (!toner || toner.quantity < exit.quantity) {
      alert('Estoque insuficiente!')
      return
    }

    const newExit: TonerExit = {
      ...exit,
      id: Date.now().toString(),
      createdAt: new Date(),
    }

    const updatedExits = [...exits, newExit]
    const updatedToners = toners.map(t => 
      t.id === exit.tonerId 
        ? { ...t, quantity: t.quantity - exit.quantity, updatedAt: new Date() }
        : t
    )

    setExits(updatedExits)
    setToners(updatedToners)
    saveToStorage('exits', updatedExits)
    saveToStorage('toners', updatedToners)
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="stock">Estoque</TabsTrigger>
          <TabsTrigger value="entry">Entrada</TabsTrigger>
          <TabsTrigger value="exit">Saída</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {lowStockItems.length > 0 && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertDescription>
                <strong>Atenção:</strong> {lowStockItems.length} item(ns) com estoque baixo!
                <Button 
                  variant="link" 
                  className="p-0 h-auto ml-2"
                  onClick={() => setActiveTab('stock')}
                >
                  Ver detalhes
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalItems}</div>
                <p className="text-xs text-muted-foreground">
                  {toners.length} tipos diferentes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
                <p className="text-xs text-muted-foreground">
                  Valor do estoque atual
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{lowStockItems.length}</div>
                <p className="text-xs text-muted-foreground">
                  Itens abaixo do mínimo
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Movimentações Hoje</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {entries.filter(e => 
                    new Date(e.entryDate).toDateString() === new Date().toDateString()
                  ).length + exits.filter(e => 
                    new Date(e.exitDate).toDateString() === new Date().toDateString()
                  ).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Entradas e saídas
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Itens com Estoque Baixo</CardTitle>
                <CardDescription>
                  Toners que precisam de reposição
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lowStockItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Todos os itens estão com estoque adequado
                    </p>
                  ) : (
                    lowStockItems.map((toner) => (
                      <div key={toner.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{toner.brand} {toner.model}</p>
                          <p className="text-sm text-muted-foreground">
                            {toner.printerModel}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="destructive">
                            {toner.quantity} / {toner.minStock}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Últimas Movimentações</CardTitle>
                <CardDescription>
                  Entradas e saídas recentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...entries.slice(-3), ...exits.slice(-3)]
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 5)
                    .map((movement, index) => {
                      const isEntry = 'entryDate' in movement
                      const toner = toners.find(t => t.id === movement.tonerId)
                      
                      return (
                        <div key={index} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {toner?.brand} {toner?.model}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {isEntry ? 'Entrada' : 'Saída'} - {movement.requestedBy}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant={isEntry ? 'default' : 'secondary'}>
                              {isEntry ? '+' : '-'}{movement.quantity}
                            </Badge>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(movement.createdAt)}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stock">
          <StockTable toners={toners} />
        </TabsContent>

        <TabsContent value="entry">
          <TonerEntryForm toners={toners} onSubmit={handleTonerEntry} />
        </TabsContent>

        <TabsContent value="exit">
          <TonerExitForm toners={toners} onSubmit={handleTonerExit} />
        </TabsContent>

        <TabsContent value="history">
          <HistoryTable entries={entries} exits={exits} toners={toners} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
