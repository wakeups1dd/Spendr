import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useFinance } from '@/contexts/FinanceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { 
  UtensilsCrossed, 
  Car, 
  ShoppingBag, 
  Gamepad2, 
  Zap, 
  Heart,
  Briefcase, 
  Laptop, 
  TrendingUp, 
  Home, 
  Plane, 
  Gift,
  Coffee, 
  Music, 
  Book, 
  Dumbbell, 
  MoreHorizontal,
  LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const iconMap: Record<string, LucideIcon> = {
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Gamepad2,
  Zap,
  Heart,
  Briefcase,
  Laptop,
  TrendingUp,
  Home,
  Plane,
  Gift,
  Coffee,
  Music,
  Book,
  Dumbbell,
  MoreHorizontal,
};

const categoryColors = [
  { name: 'Orange', value: 'category-food', bg: 'bg-category-food' },
  { name: 'Blue', value: 'category-transport', bg: 'bg-category-transport' },
  { name: 'Purple', value: 'category-shopping', bg: 'bg-category-shopping' },
  { name: 'Pink', value: 'category-entertainment', bg: 'bg-category-entertainment' },
  { name: 'Green', value: 'category-utilities', bg: 'bg-category-utilities' },
  { name: 'Red', value: 'category-health', bg: 'bg-category-health' },
  { name: 'Gray', value: 'category-other', bg: 'bg-category-other' },
];

const iconOptions = [
  'UtensilsCrossed', 'Car', 'ShoppingBag', 'Gamepad2', 'Zap', 'Heart',
  'Briefcase', 'Laptop', 'TrendingUp', 'Home', 'Plane', 'Gift',
  'Coffee', 'Music', 'Book', 'Dumbbell', 'MoreHorizontal'
];

const Categories = () => {
  const { categories, addCategory } = useFinance();
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: 'MoreHorizontal',
    color: 'category-other',
    type: 'expense' as 'income' | 'expense' | 'both',
  });

  const handleAddCategory = () => {
    if (!newCategory.name.trim()) {
      toast.error('Please enter a category name');
      return;
    }
    addCategory(newCategory);
    toast.success('Category added successfully');
    setShowAddCategory(false);
    setNewCategory({
      name: '',
      icon: 'MoreHorizontal',
      color: 'category-other',
      type: 'expense',
    });
  };

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent className="h-5 w-5" /> : null;
  };

  const getColorClass = (colorValue: string) => {
    const color = categoryColors.find(c => c.value === colorValue);
    return color?.bg || 'bg-category-other';
  };

  const incomeCategories = categories.filter(c => c.type === 'income' || c.type === 'both');
  const expenseCategories = categories.filter(c => c.type === 'expense' || c.type === 'both');

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
              Categories
            </h1>
            <p className="mt-1 text-muted-foreground">
              Manage your income and expense categories
            </p>
          </div>
          <Button onClick={() => setShowAddCategory(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </div>

        {/* Expense Categories */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Expense Categories
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {expenseCategories.map((category) => (
              <div
                key={category.id}
                className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:shadow-card-hover"
              >
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-xl text-white',
                    getColorClass(category.color)
                  )}
                >
                  {getIcon(category.icon)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{category.name}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {category.type}
                  </p>
                </div>
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Income Categories */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Income Categories
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {incomeCategories.map((category) => (
              <div
                key={category.id}
                className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:shadow-card-hover"
              >
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-xl text-white',
                    getColorClass(category.color)
                  )}
                >
                  {getIcon(category.icon)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{category.name}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {category.type}
                  </p>
                </div>
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Category Dialog */}
      <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
            <DialogDescription>
              Create a new category for your transactions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                placeholder="e.g., Groceries, Rent, etc."
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={newCategory.type}
                onValueChange={(value: 'income' | 'expense' | 'both') =>
                  setNewCategory({ ...newCategory, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {categoryColors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className={cn(
                      'h-8 w-8 rounded-lg transition-all',
                      color.bg,
                      newCategory.color === color.value
                        ? 'ring-2 ring-foreground ring-offset-2'
                        : 'hover:scale-110'
                    )}
                    onClick={() =>
                      setNewCategory({ ...newCategory, color: color.value })
                    }
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="grid grid-cols-6 gap-2">
                {iconOptions.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg border transition-all',
                      newCategory.icon === icon
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    )}
                    onClick={() => setNewCategory({ ...newCategory, icon })}
                  >
                    {getIcon(icon)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowAddCategory(false)}
              >
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleAddCategory}>
                Add Category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Categories;
