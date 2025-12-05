import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Wallet,
  BarChart3,
  Shield,
  Smartphone,
  ArrowRight,
  TrendingUp,
  PieChart,
  Mail,
  Lock,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading, signInWithGoogle, signUpWithEmail, signInWithEmail } = useAuth();

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (authMode === 'signup') {
        const result = await signUpWithEmail(email, password);
        console.log('Signup result:', result);
        if (result.error) {
          setError(result.error);
        } else if (result.needsConfirmation) {
          setEmailSent(true);
        } else {
          // No confirmation needed, user is logged in
          navigate('/dashboard');
        }
      } else {
        const result = await signInWithEmail(email, password);
        console.log('Signin result:', result);
        if (result.error) {
          setError(result.error);
        } else {
          // Successful sign in - navigate to dashboard
          navigate('/dashboard');
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
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
            <span className="text-xl font-bold text-foreground">Spendr</span>
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

              {/* Auth Section */}
              <div className="mt-10 max-w-md">
                {emailSent ? (
                  <div className="rounded-xl border border-income/20 bg-income/10 p-6 text-center">
                    <CheckCircle className="mx-auto h-12 w-12 text-income" />
                    <h3 className="mt-4 text-lg font-semibold text-foreground">Check your email!</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      We've sent a confirmation link to <strong>{email}</strong>.
                      Click the link to activate your account.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => {
                        setEmailSent(false);
                        setEmail('');
                        setPassword('');
                      }}
                    >
                      Back to login
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Google Sign In */}
                    <Button
                      variant="google"
                      size="lg"
                      onClick={handleGoogleLogin}
                      className="w-full gap-3"
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
                      Continue with Google
                    </Button>

                    {/* Divider */}
                    <div className="my-6 flex items-center gap-4">
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-sm text-muted-foreground">or continue with email</span>
                      <div className="h-px flex-1 bg-border" />
                    </div>

                    {/* Email Form */}
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="password"
                            type="password"
                            placeholder={authMode === 'signup' ? 'Min. 6 characters' : '••••••••'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10"
                            minLength={6}
                            required
                          />
                        </div>
                      </div>

                      {error && (
                        <p className="text-sm text-destructive">{error}</p>
                      )}

                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {authMode === 'signup' ? 'Creating account...' : 'Signing in...'}
                          </>
                        ) : (
                          authMode === 'signup' ? 'Create Account' : 'Sign In'
                        )}
                      </Button>
                    </form>

                    {/* Toggle Auth Mode */}
                    <p className="mt-4 text-center text-sm text-muted-foreground">
                      {authMode === 'signin' ? (
                        <>
                          Don't have an account?{' '}
                          <button
                            type="button"
                            onClick={() => {
                              setAuthMode('signup');
                              setError(null);
                            }}
                            className="font-medium text-primary hover:underline"
                          >
                            Sign up
                          </button>
                        </>
                      ) : (
                        <>
                          Already have an account?{' '}
                          <button
                            type="button"
                            onClick={() => {
                              setAuthMode('signin');
                              setError(null);
                            }}
                            className="font-medium text-primary hover:underline"
                          >
                            Sign in
                          </button>
                        </>
                      )}
                    </p>
                  </>
                )}
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
                        className={`font-medium ${item.type === 'income' ? 'text-income' : 'text-expense'
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
            Join thousands of users who have taken control of their finances with Spendr.
          </p>
          <Button
            variant="default"
            size="lg"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
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
          <p>&copy; {new Date().getFullYear()} Spendr. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
