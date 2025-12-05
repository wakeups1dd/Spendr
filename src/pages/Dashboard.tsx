import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { SpendingChart } from '@/components/dashboard/SpendingChart';
import { CategoryChart } from '@/components/dashboard/CategoryChart';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { useFinance } from '@/contexts/FinanceContext';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardStats, getMonthlyComparison } from '@/data/dataHelpers';
import { Wallet, TrendingUp, TrendingDown, CreditCard, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { TransactionForm } from '@/components/transactions/TransactionForm';

const Dashboard = () => {
  const { transactions, loading } = useFinance();
  const { user } = useAuth();
  const stats = getDashboardStats(transactions);
  const comparison = getMonthlyComparison(transactions);
  const [showAddTransaction, setShowAddTransaction] = useState(false);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[calc(100vh-100px)] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  // For expenses, "down" is actually good (spending less)
  const getExpenseTrendDirection = (trend: 'up' | 'down' | 'neutral') => {
    if (trend === 'up') return 'down'; // Spending more is bad
    if (trend === 'down') return 'up'; // Spending less is good
    return 'neutral';
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
              Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'}
            </h1>
            <p className="mt-1 text-muted-foreground">
              Here's what's happening with your finances
            </p>
          </div>
          <Button onClick={() => setShowAddTransaction(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Transaction
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Balance"
            value={formatCurrency(stats.balance)}
            subtitle="vs last month"
            icon={<Wallet className="h-6 w-6" />}
            trend={comparison.balanceTrend === 'neutral' ? undefined : comparison.balanceTrend}
            trendValue={comparison.balanceChange !== 0 ? formatPercentage(comparison.balanceChange) : undefined}
            variant="balance"
          />
          <StatCard
            title="Total Income"
            value={formatCurrency(stats.totalIncome)}
            subtitle="vs last month"
            icon={<TrendingUp className="h-6 w-6" />}
            trend={comparison.incomeTrend === 'neutral' ? undefined : comparison.incomeTrend}
            trendValue={comparison.incomeChange !== 0 ? formatPercentage(comparison.incomeChange) : undefined}
            variant="income"
          />
          <StatCard
            title="Total Expenses"
            value={formatCurrency(stats.totalExpense)}
            subtitle="vs last month"
            icon={<TrendingDown className="h-6 w-6" />}
            trend={comparison.expenseTrend === 'neutral' ? undefined : getExpenseTrendDirection(comparison.expenseTrend)}
            trendValue={comparison.expenseChange !== 0 ? formatPercentage(comparison.expenseChange) : undefined}
            variant="expense"
          />
          <StatCard
            title="Transactions"
            value={stats.transactionCount.toString()}
            subtitle="This month"
            icon={<CreditCard className="h-6 w-6" />}
            variant="default"
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          <SpendingChart />
          <CategoryChart />
        </div>

        {/* Recent Transactions */}
        <RecentTransactions />
      </div>

      <TransactionForm
        open={showAddTransaction}
        onOpenChange={setShowAddTransaction}
      />
    </DashboardLayout>
  );
};

export default Dashboard;

