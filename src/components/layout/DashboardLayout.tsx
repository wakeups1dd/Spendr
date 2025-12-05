import { ReactNode, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, loading } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed left-0 top-0 z-40 h-screen">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center border-b border-border bg-card px-4 h-16">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-4">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar className="border-none" />
          </SheetContent>
        </Sheet>
        <span className="text-lg font-bold">Spendr</span>
      </div>

      {/* Main Content */}
      <main className="md:pl-64 pt-16 md:pt-0">
        <div className="min-h-screen p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

