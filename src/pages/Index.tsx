import { useNavigate } from 'react-router-dom';
import { useFinance } from '@/contexts/FinanceContext';
import { Button } from '@/components/ui/button';
import { 
  Wallet, 
  BarChart3, 
  Shield, 
  Smartphone, 
  ArrowRight,
  TrendingUp,
  PieChart
} from 'lucide-react';
import { useEffect } from 'react';

const Index = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useFinance();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleLogin = () => {
    login();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-[0.03]" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-income/5 to-transparent" />
        
        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
              <Wallet className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">FinTrack</span>
          </div>
        </nav>

        <div className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-16 lg:pt-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
            <div className="flex flex-col justify-center">
              <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full bg-income/10 px-4 py-2 text-sm font-medium text-income">
                <TrendingUp className="h-4 w-4" />
                Track your finances smarter
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Take Control of Your{' '}
                <span className="bg-gradient-to-r from-primary to-income bg-clip-text text-transparent">
                  Money
                </span>
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground lg:text-xl">
                Track expenses, monitor income, and understand your spending patterns 
                with beautiful charts and smart SMS parsing.
              </p>
              
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Button
                  variant="google"
                  size="lg"
                  onClick={handleGoogleLogin}
                  className="gap-3"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a href="#features" className="gap-2">
                    Learn More
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              </div>

              <p className="mt-6 text-sm text-muted-foreground">
                Free to use • No credit card required • Bank-level security
              </p>
            </div>

            {/* Hero illustration */}
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/10 to-income/10 blur-3xl" />
              <div className="relative rounded-2xl border border-border bg-card p-6 shadow-xl">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Balance</p>
                    <p className="text-3xl font-bold text-foreground">$24,582.00</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-income/10 text-income">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-income/10 p-4">
                    <p className="text-xs text-muted-foreground">Income</p>
                    <p className="text-xl font-semibold text-income">+$6,200</p>
                  </div>
                  <div className="rounded-xl bg-expense/10 p-4">
                    <p className="text-xs text-muted-foreground">Expenses</p>
                    <p className="text-xl font-semibold text-expense">-$2,847</p>
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  {[
                    { name: 'Salary', amount: '+$5,000', type: 'income' },
                    { name: 'Groceries', amount: '-$234.50', type: 'expense' },
                    { name: 'Freelance', amount: '+$1,200', type: 'income' },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg bg-secondary/50 p-3"
                    >
                      <span className="text-sm text-foreground">{item.name}</span>
                      <span
                        className={`font-medium ${
                          item.type === 'income' ? 'text-income' : 'text-expense'
                        }`}
                      >
                        {item.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="bg-secondary/30 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Everything you need to manage your finances
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Powerful features to help you take control of your money
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: BarChart3,
                title: 'Visual Analytics',
                description: 'Beautiful charts and graphs to understand your spending patterns',
              },
              {
                icon: Smartphone,
                title: 'SMS Parsing',
                description: 'Automatically import transactions from bank SMS messages',
              },
              {
                icon: PieChart,
                title: 'Category Insights',
                description: 'See where your money goes with detailed category breakdowns',
              },
              {
                icon: Shield,
                title: 'Secure & Private',
                description: 'Your financial data is encrypted and never shared',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group rounded-2xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Ready to start tracking?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join thousands of users who have taken control of their finances with FinTrack.
          </p>
          <Button
            variant="default"
            size="lg"
            onClick={handleGoogleLogin}
            className="mt-8"
          >
            Get Started Free
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} FinTrack. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
