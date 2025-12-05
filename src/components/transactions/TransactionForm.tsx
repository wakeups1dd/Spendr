import { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { TransactionType, TransactionSource } from '@/types/finance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface TransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TransactionForm = ({ open, onOpenChange }: TransactionFormProps) => {
  const { categories, addTransaction } = useFinance();
  const [type, setType] = useState<TransactionType>('expense');
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: '',
    merchant: '',
    notes: '',
  });

  const filteredCategories = categories.filter(
    (cat) => cat.type === type || cat.type === 'both'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    addTransaction({
      date: formData.date,
      amount: parseFloat(formData.amount),
      category: formData.category,
      merchant: formData.merchant || 'Unknown', // Provide default if empty
      type,
      source: 'manual' as TransactionSource,
      notes: formData.notes || undefined,
    });

    toast.success('Transaction added successfully');
    onOpenChange(false);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      amount: '',
      category: '',
      merchant: '',
      notes: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogDescription>
            Record a new income or expense
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Toggle */}
          <div className="flex gap-2 rounded-lg bg-secondary p-1">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={cn(
                'flex-1 rounded-md py-2 text-sm font-medium transition-all',
                type === 'expense'
                  ? 'bg-expense text-white shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={cn(
                'flex-1 rounded-md py-2 text-sm font-medium transition-all',
                type === 'income'
                  ? 'bg-income text-white shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Income
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    ₹
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="pl-7"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="merchant">Merchant / Description (optional)</Label>
              <Input
                id="merchant"
                placeholder="e.g., Whole Foods, Uber, etc."
                value={formData.merchant}
                onChange={(e) =>
                  setFormData({ ...formData, merchant: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional details..."
                rows={2}
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant={type === 'income' ? 'income' : 'expense'}
              className="flex-1"
            >
              Add {type === 'income' ? 'Income' : 'Expense'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog >
  );
};
