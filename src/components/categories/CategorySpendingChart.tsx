
import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { Transaction, Category } from "@/types/finance";
import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, eachWeekOfInterval } from "date-fns";

interface CategorySpendingChartProps {
  currentTransactions: Transaction[];
  comparisonTransactions: Transaction[];
  currentPeriod: string;
  comparisonPeriod: string;
  category: Category;
}

const CategorySpendingChart = ({ 
  currentTransactions, 
  comparisonTransactions,
  currentPeriod,
  comparisonPeriod,
  category
}: CategorySpendingChartProps) => {
  
  // Function to group transactions by days or weeks
  const groupTransactionsByPeriod = (transactions: Transaction[], isWeekly: boolean) => {
    // If there are less than 3 transactions, don't try to group
    if (transactions.length < 3) {
      return transactions.map(t => ({
        date: format(parseISO(t.date), 'MMM dd'),
        amount: t.amount
      }));
    }
    
    // Sort transactions by date
    const sortedTransactions = [...transactions].sort(
      (a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()
    );
    
    if (sortedTransactions.length === 0) return [];
    
    // Get the date range
    const firstDate = parseISO(sortedTransactions[0].date);
    const lastDate = parseISO(sortedTransactions[sortedTransactions.length - 1].date);
    
    // Create periods (days or weeks)
    let periods;
    if (isWeekly) {
      periods = eachWeekOfInterval(
        { start: startOfWeek(firstDate), end: endOfWeek(lastDate) },
        { weekStartsOn: 1 } // Start weeks on Monday
      );
    } else {
      periods = eachDayOfInterval({ start: firstDate, end: lastDate });
    }
    
    // Create data for each period
    return periods.map((period, index) => {
      let periodStart, periodEnd;
      
      if (isWeekly) {
        periodStart = period;
        periodEnd = endOfWeek(period, { weekStartsOn: 1 });
      } else {
        periodStart = period;
        periodEnd = period;
      }
      
      // Filter transactions for this period
      const periodTransactions = sortedTransactions.filter(t => {
        const txDate = parseISO(t.date);
        return txDate >= periodStart && txDate <= periodEnd;
      });
      
      // Calculate total for this period
      const periodTotal = periodTransactions.reduce((sum, t) => sum + t.amount, 0);
      
      return {
        date: isWeekly 
          ? `Week ${index + 1}` 
          : format(period, 'MMM dd'),
        amount: periodTotal
      };
    });
  };
  
  // Determine if we should group by weeks or days
  const shouldGroupByWeeks = useMemo(() => {
    // If we have transactions spanning more than 14 days, group by weeks
    if (currentTransactions.length < 3) return false;
    
    const dates = currentTransactions.map(t => parseISO(t.date));
    const sortedDates = dates.sort((a, b) => a.getTime() - b.getTime());
    
    if (sortedDates.length === 0) return false;
    
    const firstDate = sortedDates[0];
    const lastDate = sortedDates[sortedDates.length - 1];
    
    const daysDifference = Math.floor((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysDifference > 14;
  }, [currentTransactions]);
  
  // Prepare chart data
  const chartData = useMemo(() => {
    const currentData = groupTransactionsByPeriod(currentTransactions, shouldGroupByWeeks);
    const comparisonData = groupTransactionsByPeriod(comparisonTransactions, shouldGroupByWeeks);
    
    // If we don't have both sets of data, just return current data
    if (comparisonData.length === 0) {
      return currentData.map(item => ({
        date: item.date,
        [currentPeriod]: item.amount
      }));
    }
    
    // Match up the periods between current and comparison data
    // This is a simplified approach that works for cases with equal number of periods
    const mergedData = [];
    
    // Use the longer of the two arrays to determine chart length
    const maxLength = Math.max(currentData.length, comparisonData.length);
    
    for (let i = 0; i < maxLength; i++) {
      const mergedItem: any = { date: i < currentData.length ? currentData[i].date : comparisonData[i].date };
      
      if (i < currentData.length) {
        mergedItem[currentPeriod] = currentData[i].amount;
      }
      
      if (i < comparisonData.length) {
        mergedItem[comparisonPeriod] = comparisonData[i].amount;
      }
      
      mergedData.push(mergedItem);
    }
    
    return mergedData;
  }, [currentTransactions, comparisonTransactions, shouldGroupByWeeks, currentPeriod, comparisonPeriod]);
  
  // Format currency for tooltip
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Trend</CardTitle>
        <CardDescription>
          {category.name} spending over time ({shouldGroupByWeeks ? 'Weekly' : 'Daily'})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 30,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip 
                  formatter={(value) => formatCurrency(value as number)}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend />
                <Bar 
                  dataKey={currentPeriod} 
                  fill={category.color} 
                  name={currentPeriod}
                />
                {chartData.some(item => item[comparisonPeriod]) && (
                  <Bar 
                    dataKey={comparisonPeriod} 
                    fill="#94a3b8" 
                    name={comparisonPeriod}
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              No data available for the selected period
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategorySpendingChart;
