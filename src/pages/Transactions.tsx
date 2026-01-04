import { useState, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TransactionList } from '@/components/transactions/TransactionList';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { SMSImportModal } from '@/components/transactions/SMSImportModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Filter, Download, Upload, MessageSquare } from 'lucide-react';
import { useFinance } from '@/contexts/FinanceContext';
import { toast } from 'sonner';

const Transactions = () => {
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showSMSImport, setShowSMSImport] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const { categories, addTransaction, loading } = useFinance();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[calc(100vh-100px)] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  const handleImportCSV = () => {
    fileInputRef.current?.click();
  };

  // ... (keep existing code)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Transactions</h1>
            <p className="mt-1 text-muted-foreground">Monitor and manage your financial activity</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => setShowSMSImport(true)}
              className="gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Import from SMS
            </Button>
            <Button
              className="gap-2"
              onClick={() => setShowAddTransaction(true)}
            >
              <Plus className="h-4 w-4" />
              Add Transaction
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[140px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Transaction List */}
        <TransactionList
          searchQuery={searchQuery}
          filterType={filterType}
          categoryFilter={categoryFilter}
        />
      </div>

      <SMSImportModal
        open={showSMSImport}
        onOpenChange={setShowSMSImport}
      />

      <TransactionForm
        open={showAddTransaction}
        onOpenChange={setShowAddTransaction}
      />
    </DashboardLayout>
  );
};

export default Transactions;

