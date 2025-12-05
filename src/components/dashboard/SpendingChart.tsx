import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getSpendingDataByPeriod, TimePeriod } from '@/data/dataHelpers';
import { useFinance } from '@/contexts/FinanceContext';
import { useState } from 'react';

const periodLabels: Record<TimePeriod, string> = {
  days: '7 Days',
  weeks: '4 Weeks',
  months: '6 Months',
  years: '1 Year',
};

export const SpendingChart = () => {
  const { transactions } = useFinance();
  const [period, setPeriod] = useState<TimePeriod>('months');

  const chartData = getSpendingDataByPeriod(transactions, period);
  const hasData = chartData.some(d => d.income > 0 || d.expense > 0);

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Spending Trends</h3>
          <p className="text-sm text-muted-foreground">Income vs Expenses over time</p>
        </div>

        {/* Time Period Selector */}
        <div className="flex rounded-lg bg-secondary p-1">
          {(Object.keys(periodLabels) as TimePeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${period === p
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[300px]">
        {!hasData ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <p>Add transactions to see your spending trends</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickFormatter={(value) => `₹${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: 'var(--shadow-lg)',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, '']}
              />
              <Legend
                iconType="circle"
                wrapperStyle={{ paddingTop: '20px' }}
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke="#34d399"
                strokeWidth={2}
                fill="url(#incomeGradient)"
                name="Income"
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke="#f87171"
                strokeWidth={2}
                fill="url(#expenseGradient)"
                name="Expenses"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

