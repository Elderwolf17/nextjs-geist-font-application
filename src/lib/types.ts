export interface Toner {
  id: string;
  barcode: string;
  brand: string;
  model: string;
  color: 'black' | 'cyan' | 'magenta' | 'yellow';
  printerModel: string;
  quantity: number;
  minStock: number;
  location: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TonerEntry {
  id: string;
  tonerId: string;
  quantity: number;
  purchaseDate: Date;
  entryDate: Date;
  requestedBy: string;
  authorizedBy: string;
  supplier: string;
  unitPrice: number;
  totalPrice: number;
  invoiceNumber: string;
  notes?: string;
  createdAt: Date;
}

export interface TonerExit {
  id: string;
  tonerId: string;
  quantity: number;
  exitDate: Date;
  requestedBy: string;
  authorizedBy: string;
  department: string;
  printerLocation: string;
  reason: string;
  notes?: string;
  createdAt: Date;
}

export interface StockMovement {
  id: string;
  tonerId: string;
  type: 'entry' | 'exit';
  quantity: number;
  previousStock: number;
  newStock: number;
  date: Date;
  user: string;
  reference: string; // ID da entrada ou saída
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  role: 'admin' | 'manager' | 'user';
  canAuthorize: boolean;
}

export interface Dashboard {
  totalToners: number;
  lowStockItems: number;
  totalValue: number;
  recentMovements: StockMovement[];
  topUsedToners: Array<{
    toner: Toner;
    usage: number;
  }>;
}
