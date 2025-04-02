
import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar } from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth, parseISO, isWithinInterval } from "date-fns";
import useFinanceData from "@/hooks/useFinanceData";
import TransactionList from "@/components/transactions/TransactionList";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CategorySpendingChart from "@/components/categories/CategorySpendingChart";
import { Transaction } from "@/types/finance";

const CategoryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { transactions, categories, accounts, getCategoryById } = useFinanceData();
  const [selectedPeriod, setSelectedPeriod] = useState("thisMonth");
  const [compareWithPeriod, setCompareWithPeriod] = useState("lastMonth");
  
  const category = useMemo(() => {
    if (!id) return null;
    return getCategoryById(id);
  }, [id, getCategoryById]);
  
  // Get date ranges
  const today = new Date();
  const thisMonthStart = startOfMonth(today);
  const thisMonthEnd = endOfMonth(today);
  const lastMonthStart = startOfMonth(subMonths(today, 1));
  const lastMonthEnd = endOfMonth(subMonths(today, 1));
  
  // Get current date range based on selected period
  const getCurrentDateRange = () => {
    if (selectedPeriod === "thisMonth") {
      return { start: thisMonthStart, end: thisMonthEnd, label: "This Month" };
    } else if (selectedPeriod === "lastMonth") {
      return { start: lastMonthStart, end: lastMonthEnd, label: "Last Month" };
    } else {
      const monthsAgo = parseInt(selectedPeriod.replace("months", ""));
      const start = startOfMonth(subMonths(today, monthsAgo));
      const end = today;
      return { start, end, label: `Last ${monthsAgo} Months` };
    }
  };
  
  // Get comparison date range
  const getComparisonDateRange = () => {
    if (compareWithPeriod === "lastMonth") {
      return { start: lastMonthStart, end: lastMonthEnd, label: "Last Month" };
    } else {
      const monthsAgo = parseInt(compareWithPeriod.replace("months", ""));
      const currentRange = getCurrentDateRange();
      const periodDuration = currentRange.end.getTime() - currentRange.start.getTime();
      const end = new Date(currentRange.start.getTime() - 1);
      const start = new Date(end.getTime() - periodDuration);
      return { start, end, label: `Previous ${currentRange.label}` };
    }
  };
  
  const currentDateRange = getCurrentDateRange();
  const comparisonDateRange = getComparisonDateRange();
  
  // Filter transactions by category and date range
  const categoryTransactions = useMemo(() => {
    if (!id) return [];
    return transactions.filter(transaction => 
      transaction.category === id &&
      isWithinInterval(parseISO(transaction.date), { 
        start: currentDateRange.start, 
        end: currentDateRange.end 
      })
    );
  }, [id, transactions, currentDateRange]);
  
  // Get comparison transactions for charts
  const comparisonTransactions = useMemo(() => {
    if (!id) return [];
    return transactions.filter(transaction => 
      transaction.category === id &&
      isWithinInterval(parseISO(transaction.date), { 
        start: comparisonDateRange.start, 
        end: comparisonDateRange.end 
      })
    );
  }, [id, transactions, comparisonDateRange]);
  
  // Calculate current period total
  const currentTotal = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
  
  // Calculate comparison period total
  const comparisonTotal = comparisonTransactions.reduce((sum, t) => sum + t.amount, 0);
  
  // Calculate percentage change
  const percentageChange = comparisonTotal === 0 
    ? 100 
    : ((currentTotal - comparisonTotal) / comparisonTotal) * 100;
  
  if (!category) {
    return (
      <MainLayout>
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold">Category not found</h2>
          <Button className="mt-4" onClick={() => navigate("/categories")}>
            Go back to Categories
          </Button>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <Helmet>
        <title>{category.name} | ExpenseTrack</title>
      </Helmet>
      
      <div className="mb-8">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => navigate("/categories")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Categories
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
              <div 
                className="w-4 h-4 rounded-full mr-2"
                style={{ backgroundColor: category.color }}
              />
              {category.name}
            </h1>
            <p className="text-muted-foreground capitalize">
              {category.type} Category
            </p>
          </div>
          
          <div className="flex gap-2">
            <Select
              value={selectedPeriod}
              onValueChange={setSelectedPeriod}
            >
              <SelectTrigger className="w-[160px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="thisMonth">This Month</SelectItem>
                <SelectItem value="lastMonth">Last Month</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="12months">Last 12 Months</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={compareWithPeriod}
              onValueChange={setCompareWithPeriod}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Compare with" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lastMonth">Last Month</SelectItem>
                <SelectItem value="1period">Previous Period</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Current Period</CardTitle>
            <CardDescription>{currentDateRange.label}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(currentTotal)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {categoryTransactions.length} transactions
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Comparison Period</CardTitle>
            <CardDescription>{comparisonDateRange.label}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(comparisonTotal)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {comparisonTransactions.length} transactions
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Change</CardTitle>
            <CardDescription>Period over period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${percentageChange > 0 ? 'text-rose-500' : percentageChange < 0 ? 'text-emerald-500' : ''}`}>
              {percentageChange > 0 ? '+' : ''}{percentageChange.toFixed(2)}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {Math.abs(currentTotal - comparisonTotal).toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
              })} {currentTotal > comparisonTotal ? 'increase' : 'decrease'}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mb-8">
        <CategorySpendingChart 
          currentTransactions={categoryTransactions}
          comparisonTransactions={comparisonTransactions}
          currentPeriod={currentDateRange.label}
          comparisonPeriod={comparisonDateRange.label}
          category={category}
        />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-4">Transactions</h2>
        <TransactionList 
          transactions={categoryTransactions}
          categories={categories}
          accounts={accounts}
          onEdit={() => {}}
          onDelete={() => {}}
        />
      </div>
    </MainLayout>
  );
};

export default CategoryDetail;
