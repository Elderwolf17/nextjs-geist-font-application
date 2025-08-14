import { Toner, TonerEntry, TonerExit, StockMovement, User } from './types';

// Dados mock para demonstração
export const mockToners: Toner[] = [
  {
    id: '1',
    barcode: '7891234567890',
    brand: 'HP',
    model: 'CF280A',
    color: 'black',
    printerModel: 'LaserJet Pro M404',
    quantity: 15,
    minStock: 5,
    location: 'Almoxarifado A1',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '2',
    barcode: '7891234567891',
    brand: 'Canon',
    model: 'CRG-045C',
    color: 'cyan',
    printerModel: 'ImageCLASS MF634',
    quantity: 3,
    minStock: 5,
    location: 'Almoxarifado A2',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
  },
  {
    id: '3',
    barcode: '7891234567892',
    brand: 'Epson',
    model: 'T664120',
    color: 'black',
    printerModel: 'EcoTank L3150',
    quantity: 8,
    minStock: 3,
    location: 'Almoxarifado B1',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-19'),
  },
];

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao.silva@empresa.com',
    department: 'TI',
    role: 'admin',
    canAuthorize: true,
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria.santos@empresa.com',
    department: 'Administrativo',
    role: 'manager',
    canAuthorize: true,
  },
  {
    id: '3',
    name: 'Pedro Costa',
    email: 'pedro.costa@empresa.com',
    department: 'Vendas',
    role: 'user',
    canAuthorize: false,
  },
];

export const mockEntries: TonerEntry[] = [
  {
    id: '1',
    tonerId: '1',
    quantity: 20,
    purchaseDate: new Date('2024-01-10'),
    entryDate: new Date('2024-01-15'),
    requestedBy: 'João Silva',
    authorizedBy: 'Maria Santos',
    supplier: 'Fornecedor ABC',
    unitPrice: 85.50,
    totalPrice: 1710.00,
    invoiceNumber: 'NF-001234',
    notes: 'Compra de rotina',
    createdAt: new Date('2024-01-15'),
  },
];

export const mockExits: TonerExit[] = [
  {
    id: '1',
    tonerId: '1',
    quantity: 5,
    exitDate: new Date('2024-01-20'),
    requestedBy: 'Pedro Costa',
    authorizedBy: 'João Silva',
    department: 'Vendas',
    printerLocation: 'Sala 201',
    reason: 'Substituição de toner vazio',
    notes: 'Impressora apresentando falhas',
    createdAt: new Date('2024-01-20'),
  },
];

// Funções para gerenciar dados no localStorage
export const getStorageKey = (key: string) => `toner-manager-${key}`;

export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const stored = localStorage.getItem(getStorageKey(key));
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

export const saveToStorage = <T>(key: string, data: T): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(getStorageKey(key), JSON.stringify(data));
  } catch (error) {
    console.error('Erro ao salvar no localStorage:', error);
  }
};

// Funções de negócio
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const generateBarcode = (): string => {
  return '789' + Math.random().toString().slice(2, 12);
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const isLowStock = (toner: Toner): boolean => {
  return toner.quantity <= toner.minStock;
};

export const calculateTotalValue = (toners: Toner[], entries: TonerEntry[]): number => {
  return toners.reduce((total, toner) => {
    const lastEntry = entries
      .filter(entry => entry.tonerId === toner.id)
      .sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime())[0];
    
    const unitPrice = lastEntry?.unitPrice || 0;
    return total + (toner.quantity * unitPrice);
  }, 0);
};
