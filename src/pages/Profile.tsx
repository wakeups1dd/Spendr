import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useFinance } from '@/contexts/FinanceContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  User,
  Mail,
  Smartphone,
  Download,
  Shield,
  LogOut,
  Camera,
  Save,
  Loader2,
  Target,
  TrendingDown,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

const Profile = () => {
  const { transactions, categories, loading } = useFinance();
  const { user, signOut, updateProfile } = useAuth();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[calc(100vh-100px)] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Budget state
  const [monthlyBudget, setMonthlyBudget] = useState<number>(0);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');

  // Load budget from localStorage
  useEffect(() => {
    const savedBudget = localStorage.getItem('spendr_monthly_budget');
    if (savedBudget) {
      setMonthlyBudget(parseFloat(savedBudget));
    }
  }, []);

  // Calculate current month's expenses
  const currentMonthExpenses = transactions
    .filter(t => {
      const date = new Date(t.date);
      const now = new Date();
      return t.type === 'expense' &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const budgetPercentage = monthlyBudget > 0 ? (currentMonthExpenses / monthlyBudget) * 100 : 0;
  const remainingBudget = monthlyBudget - currentMonthExpenses;

  const saveBudget = () => {
    const budget = parseFloat(budgetInput) || 0;
    setMonthlyBudget(budget);
    localStorage.setItem('spendr_monthly_budget', budget.toString());
    setIsEditingBudget(false);
    toast.success('Monthly budget saved!');
  };

  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name || '');
      setAvatarUrl(user.user_metadata?.avatar_url || user.user_metadata?.picture || '');
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const result = await updateProfile({
        full_name: fullName,
        avatar_url: avatarUrl,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    const headers = ['Date', 'Amount', 'Type', 'Category', 'Merchant', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...transactions.map((t) =>
        [
          t.date,
          t.amount,
          t.type,
          t.category,
          `"${t.merchant}"`,
          `"${t.notes || ''}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Transactions exported successfully');
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
            Profile Settings
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information
                  </CardDescription>
                </div>
                {!isEditing ? (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setFullName(user?.user_metadata?.full_name || '');
                        setAvatarUrl(user?.user_metadata?.avatar_url || user?.user_metadata?.picture || '');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSaveProfile} disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                <div className="relative">
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-border bg-secondary">
                    <img
                      src={isEditing ? (avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${fullName || 'User'}`) : (user?.user_metadata?.avatar_url || user?.user_metadata?.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.user_metadata?.full_name || 'User'}`)}
                      alt="Profile"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=User`;
                      }}
                    />
                  </div>
                  {isEditing && (
                    <div className="absolute -bottom-1 -right-1 rounded-full bg-primary p-1.5">
                      <Camera className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-xl font-semibold text-foreground">
                    {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                  </h3>
                  <p className="text-muted-foreground">{user?.email}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Member since{' '}
                    {user?.created_at
                      ? format(new Date(user.created_at), 'MMMM yyyy')
                      : 'December 2024'}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Full Name
                  </Label>
                  <Input
                    value={isEditing ? fullName : (user?.user_metadata?.full_name || '')}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Email
                  </Label>
                  <Input value={user?.email || ''} disabled />
                </div>
              </div>

              {isEditing && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Camera className="h-4 w-4 text-muted-foreground" />
                    Profile Picture URL
                  </Label>
                  <Input
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/your-photo.jpg"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a URL to an image for your profile picture
                  </p>
                </div>
              )}

              {!isEditing && (
                <p className="text-sm text-muted-foreground">
                  Click "Edit Profile" to update your name and profile picture
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Account Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-4 transition-colors hover:bg-secondary">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <TrendingDown className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">Total Transactions</span>
                </div>
                <span className="font-bold text-foreground">
                  {transactions.length}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-4 transition-colors hover:bg-secondary">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                    <Target className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">Categories</span>
                </div>
                <span className="font-bold text-foreground">10</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-4 transition-colors hover:bg-secondary">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                    <Smartphone className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">SMS Imports</span>
                </div>
                <span className="font-bold text-foreground">
                  {transactions.filter((t) => t.source === 'sms').length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Cards */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Budget Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Budget Settings
              </CardTitle>
              <CardDescription>
                Set your monthly spending limit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Monthly Budget Input */}
              <div className="space-y-2">
                <Label>Monthly Budget</Label>
                {isEditingBudget ? (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                      <Input
                        type="number"
                        value={budgetInput}
                        onChange={(e) => setBudgetInput(e.target.value)}
                        className="pl-8"
                        placeholder="50000"
                        autoFocus
                      />
                    </div>
                    <Button onClick={saveBudget} size="sm">
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingBudget(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div
                    className="flex items-center justify-between rounded-lg bg-secondary p-3 cursor-pointer hover:bg-secondary/80 transition-colors"
                    onClick={() => {
                      setBudgetInput(monthlyBudget.toString());
                      setIsEditingBudget(true);
                    }}
                  >
                    <span className="text-lg font-semibold text-foreground">
                      {monthlyBudget > 0 ? `₹${monthlyBudget.toLocaleString('en-IN')}` : 'Not set'}
                    </span>
                    <span className="text-sm text-muted-foreground">Click to edit</span>
                  </div>
                )}
              </div>

              {/* Budget Progress */}
              {monthlyBudget > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">This month's spending</span>
                      <span className="font-medium text-foreground">
                        ₹{currentMonthExpenses.toLocaleString('en-IN')} / ₹{monthlyBudget.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-3 w-full rounded-full bg-secondary overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${budgetPercentage > 100
                          ? 'bg-destructive'
                          : budgetPercentage > 80
                            ? 'bg-yellow-500'
                            : 'bg-income'
                          }`}
                        style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                      />
                    </div>

                    {/* Status Message */}
                    <div className={`flex items-center gap-2 text-sm ${remainingBudget < 0 ? 'text-destructive' : 'text-muted-foreground'
                      }`}>
                      <TrendingDown className="h-4 w-4" />
                      {remainingBudget < 0 ? (
                        <span>Over budget by ₹{Math.abs(remainingBudget).toLocaleString('en-IN')}</span>
                      ) : (
                        <span>₹{remainingBudget.toLocaleString('en-IN')} remaining this month</span>
                      )}
                    </div>
                  </div>
                </>
              )}

              {monthlyBudget === 0 && (
                <p className="text-sm text-muted-foreground">
                  Set a monthly budget to track your spending progress
                </p>
              )}
            </CardContent>
          </Card>

          {/* SMS Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                SMS Integration
                <span className="ml-2 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  Coming Soon
                </span>
              </CardTitle>
              <CardDescription>
                Auto-import transactions from bank SMS messages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-secondary/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      Android App In Development
                    </p>
                    <p className="text-sm text-muted-foreground">
                      We're building a companion app to automatically sync your bank SMS
                    </p>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full gap-2" disabled>
                <Download className="h-4 w-4" />
                Coming Soon
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                For now, you can manually add transactions or import from CSV
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Data & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Data & Security
            </CardTitle>
            <CardDescription>
              Manage your data and account security
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-foreground">Export All Data</p>
                <p className="text-sm text-muted-foreground">
                  Download all your transactions as a CSV file
                </p>
              </div>
              <Button variant="outline" className="gap-2" onClick={handleExport}>
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
            <Separator className="my-4" />
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-foreground">Sign Out</p>
                <p className="text-sm text-muted-foreground">
                  Sign out of your account on this device
                </p>
              </div>
              <Button variant="destructive" className="gap-2" onClick={signOut}>
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
