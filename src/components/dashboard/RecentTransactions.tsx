import { useFinance } from '@/contexts/FinanceContext';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const RecentTransactions = () => {
  const { transactions } = useFinance();
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
          <p className="text-sm text-muted-foreground">Your latest activity</p>
        </div>
        <Link to="/transactions">
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </Link>
      </div>
      <div className="space-y-4">
        {recentTransactions.map((transaction, index) => (
          <div
            key={transaction.id}
            className={cn(
              'flex items-center justify-between py-3 opacity-0 animate-slide-up',
              index > 0 && 'border-t border-border'
            )}
            style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl',
                  transaction.type === 'income'
                    ? 'bg-income/10 text-income'
                    : 'bg-expense/10 text-expense'
                )}
              >
                {transaction.type === 'income' ? (
                  <ArrowDownRight className="h-5 w-5" />
                ) : (
                  <ArrowUpRight className="h-5 w-5" />
                )}
              </div>
              <div>
                <p className="font-medium text-foreground">{transaction.merchant}</p>
                <p className="text-sm text-muted-foreground">{transaction.category}</p>
              </div>
            </div>
            <div className="text-right">
              <p
                className={cn(
                  'font-semibold',
                  transaction.type === 'income' ? 'text-income' : 'text-expense'
                )}
              >
                {transaction.type === 'income' ? '+' : '-'}$
                {transaction.amount.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(transaction.date), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
