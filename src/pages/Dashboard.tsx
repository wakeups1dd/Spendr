import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { SpendingChart } from '@/components/dashboard/SpendingChart';
import { CategoryChart } from '@/components/dashboard/CategoryChart';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { useFinance } from '@/contexts/FinanceContext';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardStats } from '@/data/mockData';
import { Wallet, TrendingUp, TrendingDown, CreditCard, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { TransactionForm } from '@/components/transactions/TransactionForm';

const Dashboard = () => {
  const { transactions } = useFinance();
  const { user } = useAuth();
  const stats = getDashboardStats(transactions);
  const [showAddTransaction, setShowAddTransaction] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
            trend="up"
            trendValue="+12.5%"
            variant="balance"
          />
          <StatCard
            title="Total Income"
            value={formatCurrency(stats.totalIncome)}
            subtitle="This month"
            icon={<TrendingUp className="h-6 w-6" />}
            trend="up"
            trendValue="+8.2%"
            variant="income"
          />
          <StatCard
            title="Total Expenses"
            value={formatCurrency(stats.totalExpense)}
            subtitle="This month"
            icon={<TrendingDown className="h-6 w-6" />}
            trend="down"
            trendValue="-3.1%"
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
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SpendingChart />
          </div>
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
