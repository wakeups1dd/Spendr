import { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Transaction } from '@/types/finance';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Trash2, 
  Edit, 
  MoreVertical,
  MessageSquare,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export const TransactionList = () => {
  const { transactions, deleteTransaction } = useFinance();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = () => {
    if (deleteId) {
      deleteTransaction(deleteId);
      toast.success('Transaction deleted');
      setDeleteId(null);
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'sms':
        return <MessageSquare className="h-3 w-3" />;
      case 'import':
        return <FileText className="h-3 w-3" />;
      default:
        return null;
    }
  };

  // Group transactions by date
  const groupedTransactions = transactions.reduce((groups, transaction) => {
    const date = transaction.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, Transaction[]>);

  const sortedDates = Object.keys(groupedTransactions).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <>
      <div className="space-y-6">
        {sortedDates.map((date) => (
          <div key={date} className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground sticky top-0 bg-background py-2">
              {format(new Date(date), 'EEEE, MMMM d, yyyy')}
            </h3>
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {groupedTransactions[date].map((transaction, index) => (
                <div
                  key={transaction.id}
                  className={cn(
                    'flex items-center justify-between p-4 transition-colors hover:bg-secondary/50',
                    index > 0 && 'border-t border-border'
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-xl',
                        transaction.type === 'income'
                          ? 'bg-income/10 text-income'
                          : 'bg-expense/10 text-expense'
                      )}
                    >
                      {transaction.type === 'income' ? (
                        <ArrowDownRight className="h-6 w-6" />
                      ) : (
                        <ArrowUpRight className="h-6 w-6" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">
                          {transaction.merchant}
                        </p>
                        {transaction.source !== 'manual' && (
                          <span className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                            {getSourceIcon(transaction.source)}
                            {transaction.source.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {transaction.category}
                      </p>
                      {transaction.notes && (
                        <p className="mt-1 text-xs text-muted-foreground/70">
                          {transaction.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p
                      className={cn(
                        'text-lg font-semibold',
                        transaction.type === 'income' ? 'text-income' : 'text-expense'
                      )}
                    >
                      {transaction.type === 'income' ? '+' : '-'}$
                      {transaction.amount.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteId(transaction.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
