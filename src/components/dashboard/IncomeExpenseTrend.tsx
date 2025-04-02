
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@/types/finance";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays, parseISO, eachDayOfInterval, isWithinInterval } from "date-fns";

interface IncomeExpenseTrendProps {
  transactions: Transaction[];
  days: number;
}

const IncomeExpenseTrend = ({ transactions, days }: IncomeExpenseTrendProps) => {
  // Calculate date range for the chart
  const endDate = new Date();
  const startDate = subDays(endDate, days);
  
  // Generate array of all dates in the range
  const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
  
  // Initialize data with all dates and zero values
  const initialData = dateRange.map(date => ({
    date,
    income: 0,
    expense: 0,
  }));
  
  // Populate data with transaction amounts
  transactions.forEach(transaction => {
    const transactionDate = parseISO(transaction.date);
    
    // Check if transaction is within our date range
    if (isWithinInterval(transactionDate, { start: startDate, end: endDate })) {
      // Find matching date in our data array
      const dateIndex = initialData.findIndex(
        d => format(d.date, 'yyyy-MM-dd') === format(transactionDate, 'yyyy-MM-dd')
      );
      
      if (dateIndex !== -1) {
        if (transaction.type === 'income') {
          initialData[dateIndex].income += transaction.amount;
        } else {
          initialData[dateIndex].expense += transaction.amount;
        }
      }
    }
  });
  
  // Format the data for the chart
  const chartData = initialData.map(item => ({
    date: format(item.date, 'MMM dd'),
    Income: item.income,
    Expenses: item.expense,
  }));
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-white shadow-md rounded-md border">
          <p className="font-medium mb-1">{label}</p>
          <p className="text-emerald-500 font-medium">
            Income: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-rose-500 font-medium">
            Expenses: {formatCurrency(payload[1].value)}
          </p>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Income vs Expenses</CardTitle>
        <CardDescription>Your financial flow over the last {days} days</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" />
            <YAxis
              tickFormatter={formatCurrency}
            />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="Income"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#colorIncome)"
            />
            <Area
              type="monotone"
              dataKey="Expenses"
              stroke="#ef4444"
              fillOpacity={1}
              fill="url(#colorExpense)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default IncomeExpenseTrend;
