import { Transaction, Category, DashboardStats } from '@/types/finance';

export const categories: Category[] = [
  { id: '1', name: 'Food & Dining', icon: 'UtensilsCrossed', color: 'category-food', type: 'expense' },
  { id: '2', name: 'Transport', icon: 'Car', color: 'category-transport', type: 'expense' },
  { id: '3', name: 'Shopping', icon: 'ShoppingBag', color: 'category-shopping', type: 'expense' },
  { id: '4', name: 'Entertainment', icon: 'Gamepad2', color: 'category-entertainment', type: 'expense' },
  { id: '5', name: 'Utilities', icon: 'Zap', color: 'category-utilities', type: 'expense' },
  { id: '6', name: 'Health', icon: 'Heart', color: 'category-health', type: 'expense' },
  { id: '7', name: 'Salary', icon: 'Briefcase', color: 'category-utilities', type: 'income' },
  { id: '8', name: 'Freelance', icon: 'Laptop', color: 'category-transport', type: 'income' },
  { id: '9', name: 'Investment', icon: 'TrendingUp', color: 'category-shopping', type: 'income' },
  { id: '10', name: 'Other', icon: 'MoreHorizontal', color: 'category-other', type: 'both' },
];

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    userId: '1',
    date: '2024-12-04',
    amount: 45.50,
    category: 'Food & Dining',
    merchant: 'Whole Foods Market',
    type: 'expense',
    source: 'manual',
    createdAt: '2024-12-04T10:30:00Z',
  },
  {
    id: '2',
    userId: '1',
    date: '2024-12-03',
    amount: 5000,
    category: 'Salary',
    merchant: 'TechCorp Inc',
    type: 'income',
    source: 'manual',
    createdAt: '2024-12-03T09:00:00Z',
  },
  {
    id: '3',
    userId: '1',
    date: '2024-12-02',
    amount: 32.00,
    category: 'Transport',
    merchant: 'Uber',
    type: 'expense',
    source: 'sms',
    createdAt: '2024-12-02T14:20:00Z',
  },
  {
    id: '4',
    userId: '1',
    date: '2024-12-01',
    amount: 150.00,
    category: 'Shopping',
    merchant: 'Amazon',
    type: 'expense',
    source: 'manual',
    createdAt: '2024-12-01T16:45:00Z',
  },
  {
    id: '5',
    userId: '1',
    date: '2024-11-30',
    amount: 89.99,
    category: 'Utilities',
    merchant: 'Electric Company',
    type: 'expense',
    source: 'manual',
    createdAt: '2024-11-30T08:00:00Z',
  },
  {
    id: '6',
    userId: '1',
    date: '2024-11-28',
    amount: 1200,
    category: 'Freelance',
    merchant: 'Client Project',
    type: 'income',
    source: 'manual',
    createdAt: '2024-11-28T12:00:00Z',
  },
  {
    id: '7',
    userId: '1',
    date: '2024-11-27',
    amount: 65.00,
    category: 'Entertainment',
    merchant: 'Netflix & Spotify',
    type: 'expense',
    source: 'sms',
    createdAt: '2024-11-27T10:00:00Z',
  },
  {
    id: '8',
    userId: '1',
    date: '2024-11-25',
    amount: 200.00,
    category: 'Health',
    merchant: 'Pharmacy',
    type: 'expense',
    source: 'manual',
    createdAt: '2024-11-25T15:30:00Z',
  },
];

export const monthlySpendingData = [
  { month: 'Jul', income: 6200, expense: 3800 },
  { month: 'Aug', income: 5800, expense: 4200 },
  { month: 'Sep', income: 6500, expense: 3500 },
  { month: 'Oct', income: 7000, expense: 4100 },
  { month: 'Nov', income: 6200, expense: 3900 },
  { month: 'Dec', income: 6200, expense: 582 },
];

export const categorySpendingData = [
  { name: 'Food & Dining', value: 450, color: '#f97316' },
  { name: 'Transport', value: 280, color: '#0ea5e9' },
  { name: 'Shopping', value: 350, color: '#a855f7' },
  { name: 'Entertainment', value: 180, color: '#ec4899' },
  { name: 'Utilities', value: 220, color: '#22c55e' },
  { name: 'Health', value: 150, color: '#ef4444' },
];

export const getDashboardStats = (transactions: Transaction[]): DashboardStats => {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    transactionCount: transactions.length,
  };
};
