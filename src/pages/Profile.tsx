import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useFinance } from '@/contexts/FinanceContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
  Calendar,
  Smartphone,
  Download,
  Shield,
  Bell,
  LogOut,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const Profile = () => {
  const { transactions } = useFinance();
  const { user, signOut } = useAuth();

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
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Your personal information from Google
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <img
                  src={user?.user_metadata?.avatar_url || user?.user_metadata?.picture || 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo'}
                  alt="Profile"
                  className="h-24 w-24 rounded-full border-4 border-border"
                />
                <div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
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
                  <Input value={user?.user_metadata?.full_name || ''} disabled />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Email
                  </Label>
                  <Input value={user?.email || ''} disabled />
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Your profile information is synced from your Google account
              </p>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Account Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-secondary p-3">
                <span className="text-sm text-muted-foreground">Total Transactions</span>
                <span className="font-semibold text-foreground">
                  {transactions.length}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-secondary p-3">
                <span className="text-sm text-muted-foreground">Categories</span>
                <span className="font-semibold text-foreground">10</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-secondary p-3">
                <span className="text-sm text-muted-foreground">SMS Imports</span>
                <span className="font-semibold text-foreground">
                  {transactions.filter((t) => t.source === 'sms').length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Cards */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Budget Alerts</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when you exceed budget limits
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Weekly Summary</p>
                  <p className="text-sm text-muted-foreground">
                    Receive a weekly spending summary
                  </p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">SMS Import Alerts</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified of new SMS imports
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* SMS Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                SMS Integration
              </CardTitle>
              <CardDescription>
                Connect your device to auto-import transactions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-secondary/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-income/10 text-income">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      Android App Available
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Download our companion app to sync SMS
                    </p>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full gap-2">
                <Download className="h-4 w-4" />
                Download Android App
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                The app automatically forwards bank SMS to your account
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
