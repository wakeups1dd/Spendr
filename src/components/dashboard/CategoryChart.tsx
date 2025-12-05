import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getCategorySpendingData } from '@/data/dataHelpers';
import { useFinance } from '@/contexts/FinanceContext';

export const CategoryChart = () => {
  const { transactions, categories } = useFinance();
  const categoryData = getCategorySpendingData(transactions, categories);

  const hasData = categoryData.length > 0;

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-card">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Spending by Category</h3>
        <p className="text-sm text-muted-foreground">Where your money goes</p>
      </div>
      <div className="h-[300px]">
        {!hasData ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <p>Add expenses to see category breakdown</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {categoryData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="hsl(var(--card))"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: 'var(--shadow-lg)',
                }}
                formatter={(value: number) => [`₹${value}`, 'Amount']}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
      {hasData && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {categoryData.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="truncate text-xs text-muted-foreground">{item.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

