import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Transaction, Category } from '@/types/finance';
import { categories as defaultCategories } from '@/data/dataHelpers';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface FinanceContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  loading: boolean;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data when user changes
  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      setTransactions([]);
      setCategories([]);
      setLoading(false);
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Transactions
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (txError) throw txError;

      const formattedTransactions: Transaction[] = (txData || []).map(t => ({
        id: t.id,
        userId: t.user_id,
        amount: Number(t.amount),
        type: t.type,
        category: t.category,
        merchant: t.merchant,
        date: t.date,
        notes: t.notes,
        source: t.source,
        rawSms: t.raw_sms,
        parsedJson: t.parsed_json,
        createdAt: t.created_at,
      }));

      setTransactions(formattedTransactions);

      // Fetch Categories
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (catError) throw catError;

      if (catData && catData.length > 0) {
        const formattedCategories: Category[] = catData.map(c => ({
          id: c.id,
          name: c.name,
          type: c.type,
          color: c.color,
          icon: c.icon,
        }));
        setCategories(formattedCategories);
      } else {
        // If no categories found, use defaults (and maybe seed them later if needed)
        // For now, we'll just use the default in-memory ones if DB is empty, 
        // but ideally we should insert them into DB for the user.
        // Let's just set defaultCategories for now to avoid empty UI.
        setCategories(defaultCategories);

        // Optional: Seed default categories to DB
        seedDefaultCategories();
      }

    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
      // Fallback to defaults if DB fails
      if (categories.length === 0) {
        setCategories(defaultCategories);
      }
    } finally {
      setLoading(false);
    }
  };

  const seedDefaultCategories = async () => {
    if (!user) return;
    try {
      const categoriesToInsert = defaultCategories.map(c => ({
        user_id: user.id,
        name: c.name,
        type: c.type,
        color: c.color,
        icon: c.icon,
      }));

      const { error } = await supabase.from('categories').insert(categoriesToInsert);
      if (error) console.error('Error seeding categories:', error);
      else fetchData(); // Refetch to get IDs
    } catch (err) {
      console.error('Error seeding categories:', err);
    }
  };

  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;

    // Optimistic update
    const tempId = crypto.randomUUID();
    const newTransaction: Transaction = {
      ...transaction,
      id: tempId,
      userId: user.id,
      createdAt: new Date().toISOString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          amount: transaction.amount,
          type: transaction.type,
          category: transaction.category,
          merchant: transaction.merchant,
          date: transaction.date,
          notes: transaction.notes,
          source: transaction.source,
        })
        .select()
        .single();

      if (error) throw error;

      // Replace temp transaction with real one
      setTransactions(prev => prev.map(t => t.id === tempId ? {
        ...t,
        id: data.id,
        createdAt: data.created_at
      } : t));

      toast.success('Transaction added');
    } catch (error: any) {
      console.error('Error adding transaction:', JSON.stringify(error, null, 2));
      toast.error(`Failed to add transaction: ${error.message || 'Unknown error'}`);
      // Revert optimistic update
      setTransactions(prev => prev.filter(t => t.id !== tempId));
    }
  }, [user]);

  const updateTransaction = useCallback(async (id: string, updates: Partial<Transaction>) => {
    // Optimistic update
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));

    try {
      const dbUpdates: any = {};
      if (updates.amount) dbUpdates.amount = updates.amount;
      if (updates.type) dbUpdates.type = updates.type;
      if (updates.category) dbUpdates.category = updates.category;
      if (updates.merchant) dbUpdates.merchant = updates.merchant;
      if (updates.date) dbUpdates.date = updates.date;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.source) dbUpdates.source = updates.source;
      if (updates.rawSms !== undefined) dbUpdates.raw_sms = updates.rawSms;
      if (updates.parsedJson !== undefined) dbUpdates.parsed_json = updates.parsedJson;

      const { error } = await supabase
        .from('transactions')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;
      toast.success('Transaction updated');
    } catch (error: any) {
      console.error('Error updating transaction:', error);
      toast.error('Failed to update transaction');
      // Revert (would need previous state, but for now we just warn)
      fetchData(); // Refetch to restore correct state
    }
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    // Optimistic update
    const prevTransactions = transactions;
    setTransactions(prev => prev.filter(t => t.id !== id));

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Transaction deleted');
    } catch (error: any) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction');
      setTransactions(prevTransactions);
    }
  }, [transactions]);

  const addCategory = useCallback(async (category: Omit<Category, 'id'>) => {
    if (!user) return;

    const tempId = crypto.randomUUID();
    const newCategory: Category = { ...category, id: tempId };
    setCategories(prev => [...prev, newCategory]);

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          user_id: user.id,
          name: category.name,
          type: category.type,
          color: category.color,
          icon: category.icon,
        })
        .select()
        .single();

      if (error) throw error;

      setCategories(prev => prev.map(c => c.id === tempId ? { ...c, id: data.id } : c));
      toast.success('Category added');
    } catch (error: any) {
      console.error('Error adding category:', JSON.stringify(error, null, 2));
      toast.error(`Failed to add category: ${error.message || 'Unknown error'}`);
      setCategories(prev => prev.filter(c => c.id !== tempId));
    }
  }, [user]);

  const updateCategory = useCallback(async (id: string, updates: Partial<Category>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));

    try {
      const { error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      toast.success('Category updated');
    } catch (error: any) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
      fetchData();
    }
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    const prevCategories = categories;
    setCategories(prev => prev.filter(c => c.id !== id));

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Category deleted');
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
      setCategories(prevCategories);
    }
  }, [categories]);

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        loading,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
