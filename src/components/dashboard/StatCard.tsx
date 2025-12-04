import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'default' | 'income' | 'expense' | 'balance';
  className?: string;
}

export const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  variant = 'default',
  className,
}: StatCardProps) => {
  const variantStyles = {
    default: 'bg-card',
    income: 'bg-gradient-to-br from-income/10 to-income/5 border-income/20',
    expense: 'bg-gradient-to-br from-expense/10 to-expense/5 border-expense/20',
    balance: 'gradient-primary text-primary-foreground',
  };

  const iconBgStyles = {
    default: 'bg-secondary text-foreground',
    income: 'bg-income/20 text-income',
    expense: 'bg-expense/20 text-expense',
    balance: 'bg-white/20 text-primary-foreground',
  };

  return (
    <div
      className={cn(
        'rounded-xl border p-6 shadow-card transition-all duration-200 hover:shadow-card-hover',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={cn(
            'text-sm font-medium',
            variant === 'balance' ? 'text-primary-foreground/80' : 'text-muted-foreground'
          )}>
            {title}
          </p>
          <p className={cn(
            'mt-2 text-3xl font-bold tracking-tight',
            variant === 'balance' ? 'text-primary-foreground' : 'text-foreground'
          )}>
            {value}
          </p>
          {(subtitle || trendValue) && (
            <div className="mt-2 flex items-center gap-2">
              {trend && trend !== 'neutral' && (
                <span className={cn(
                  'flex items-center gap-1 text-xs font-medium',
                  trend === 'up' ? 'text-income' : 'text-expense'
                )}>
                  {trend === 'up' ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {trendValue}
                </span>
              )}
              {subtitle && (
                <span className={cn(
                  'text-xs',
                  variant === 'balance' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                )}>
                  {subtitle}
                </span>
              )}
            </div>
          )}
        </div>
        <div className={cn(
          'flex h-12 w-12 items-center justify-center rounded-xl',
          iconBgStyles[variant]
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
};
