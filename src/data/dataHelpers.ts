import { Transaction, Category, DashboardStats } from '@/types/finance';

// Default categories for new users
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
  { id: '10', name: 'Other Expense', icon: 'MoreHorizontal', color: 'category-other', type: 'expense' },
  { id: '11', name: 'Other Income', icon: 'MoreHorizontal', color: 'category-other', type: 'income' },
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

// Calculate month-over-month comparison
export interface MonthlyComparison {
  incomeChange: number;
  expenseChange: number;
  balanceChange: number;
  incomeTrend: 'up' | 'down' | 'neutral';
  expenseTrend: 'up' | 'down' | 'neutral';
  balanceTrend: 'up' | 'down' | 'neutral';
}

export const getMonthlyComparison = (transactions: Transaction[]): MonthlyComparison => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Get last month (handle year boundary)
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  // Filter transactions for current month
  const currentMonthTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  // Filter transactions for last month
  const lastMonthTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
  });

  // Calculate current month stats
  const currentIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const currentExpense = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const currentBalance = currentIncome - currentExpense;

  // Calculate last month stats
  const lastIncome = lastMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const lastExpense = lastMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const lastBalance = lastIncome - lastExpense;

  // Calculate percentage changes
  const calcChange = (current: number, last: number): number => {
    if (last === 0) return current > 0 ? 100 : 0;
    return ((current - last) / last) * 100;
  };

  const incomeChange = calcChange(currentIncome, lastIncome);
  const expenseChange = calcChange(currentExpense, lastExpense);
  const balanceChange = calcChange(currentBalance, lastBalance);

  // Determine trends
  const getTrend = (change: number): 'up' | 'down' | 'neutral' => {
    if (change > 0) return 'up';
    if (change < 0) return 'down';
    return 'neutral';
  };

  return {
    incomeChange,
    expenseChange,
    balanceChange,
    incomeTrend: getTrend(incomeChange),
    expenseTrend: getTrend(expenseChange),
    balanceTrend: getTrend(balanceChange),
  };
};

// Generate chart data from actual transactions
export const getMonthlySpendingData = (transactions: Transaction[]) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentYear = new Date().getFullYear();

  const monthlyData = months.map((month, index) => {
    const monthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === index && date.getFullYear() === currentYear;
    });

    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return { month, income, expense };
  });

  // Return last 6 months with data
  const currentMonth = new Date().getMonth();
  const startIndex = Math.max(0, currentMonth - 5);
  return monthlyData.slice(startIndex, currentMonth + 1);
};

// Generate spending data by different time periods
export type TimePeriod = 'days' | 'weeks' | 'months' | 'years';

export const getSpendingDataByPeriod = (transactions: Transaction[], period: TimePeriod) => {
  const now = new Date();

  switch (period) {
    case 'days': {
      // Last 7 days
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

        const dayTransactions = transactions.filter(t => t.date === dateStr);
        const income = dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expense = dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

        days.push({ label: dayName, income, expense });
      }
      return days;
    }

    case 'weeks': {
      // Last 4 weeks
      const weeks = [];
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - (i * 7) - weekStart.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        const weekTransactions = transactions.filter(t => {
          const date = new Date(t.date);
          return date >= weekStart && date <= weekEnd;
        });

        const income = weekTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expense = weekTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

        weeks.push({ label: `Week ${4 - i}`, income, expense });
      }
      return weeks;
    }

    case 'months': {
      // Last 6 months (same as getMonthlySpendingData)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentYear = now.getFullYear();
      const data = [];

      for (let i = 5; i >= 0; i--) {
        let monthIndex = now.getMonth() - i;
        let year = currentYear;
        if (monthIndex < 0) {
          monthIndex += 12;
          year -= 1;
        }

        const monthTransactions = transactions.filter(t => {
          const date = new Date(t.date);
          return date.getMonth() === monthIndex && date.getFullYear() === year;
        });

        const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expense = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

        data.push({ label: months[monthIndex], income, expense });
      }
      return data;
    }

    case 'years': {
      // Last 1 year (12 months)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const data = [];
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      for (let i = 11; i >= 0; i--) {
        let monthIndex = currentMonth - i;
        let year = currentYear;

        if (monthIndex < 0) {
          monthIndex += 12;
          year -= 1;
        }

        const monthTransactions = transactions.filter(t => {
          const date = new Date(t.date);
          return date.getMonth() === monthIndex && date.getFullYear() === year;
        });

        const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expense = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

        // Format: "Jan 24"
        const yearShort = year.toString().slice(-2);
        data.push({ label: `${months[monthIndex]} '${yearShort}`, income, expense });
      }
      return data;
    }

    default:
      return [];
  }
};

// Generate category spending data from actual transactions
export const getCategorySpendingData = (transactions: Transaction[], categoryList: Category[]) => {
  const expenseTransactions = transactions.filter(t => t.type === 'expense');

  const categoryColors: Record<string, string> = {
    'Food & Dining': '#f97316',
    'Transport': '#0ea5e9',
    'Shopping': '#a855f7',
    'Entertainment': '#ec4899',
    'Utilities': '#22c55e',
    'Health': '#ef4444',
    'Other': '#6b7280',
  };

  const categoryTotals = expenseTransactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(categoryTotals)
    .map(([name, value]) => ({
      name,
      value,
      color: categoryColors[name] || '#6b7280',
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
};

