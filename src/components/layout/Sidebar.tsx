import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Tags, 
  User, 
  LogOut,
  Wallet,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFinance } from '@/contexts/FinanceContext';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { path: '/categories', label: 'Categories', icon: Tags },
  { path: '/profile', label: 'Profile', icon: User },
];

export const Sidebar = () => {
  const location = useLocation();
  const { logout, user } = useFinance();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-border px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
            <Wallet className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">FinTrack</h1>
            <p className="text-xs text-muted-foreground">Personal Finance</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3 rounded-lg bg-secondary p-3">
            <img
              src={user?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo'}
              alt="User avatar"
              className="h-10 w-10 rounded-full bg-muted"
            />
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {user?.name || 'Demo User'}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.email || 'demo@example.com'}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
};
