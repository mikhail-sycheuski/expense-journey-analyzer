
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Category, Transaction } from "@/types/finance";

interface ExpenseByCategoryChartProps {
  transactions: Transaction[];
  categories: Category[];
  period: string;
}

const ExpenseByCategoryChart = ({ transactions, categories, period }: ExpenseByCategoryChartProps) => {
  // Filter transactions to expenses only
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  
  // Group expenses by category
  const expensesByCategory = expenseTransactions.reduce((acc, transaction) => {
    const { category, amount } = transaction;
    
    if (!acc[category]) {
      acc[category] = 0;
    }
    
    acc[category] += amount;
    return acc;
  }, {} as Record<string, number>);
  
  // Format data for the pie chart
  const chartData = Object.entries(expensesByCategory).map(([categoryId, amount]) => {
    const category = categories.find(c => c.id === categoryId);
    return {
      name: category ? category.name : 'Uncategorized',
      value: amount,
      color: category ? category.color : '#6b7280',
    };
  }).sort((a, b) => b.value - a.value); // Sort from highest to lowest
  
  // Format amount for tooltip
  const formatAmount = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-white shadow-md rounded-md border">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-finance-blue font-semibold">{formatAmount(payload[0].value)}</p>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Expenses by Category</CardTitle>
        <CardDescription>How your expenses are distributed across categories this {period}</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            No expense data available for this period
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpenseByCategoryChart;
