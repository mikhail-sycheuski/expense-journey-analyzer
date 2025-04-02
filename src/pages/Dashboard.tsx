
import { useState } from "react";
import { Helmet } from "react-helmet";
import MainLayout from "@/components/layout/MainLayout";
import DashboardSummary from "@/components/dashboard/DashboardSummary";
import ExpenseByCategoryChart from "@/components/dashboard/ExpenseByCategoryChart";
import IncomeExpenseTrend from "@/components/dashboard/IncomeExpenseTrend";
import BudgetProgressList from "@/components/dashboard/BudgetProgressList";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import useFinanceData from "@/hooks/useFinanceData";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const Dashboard = () => {
  const { transactions, categories, budgets, accounts } = useFinanceData();
  const [selectedPeriod, setSelectedPeriod] = useState("thisMonth");
  
  // Calculate date ranges
  const today = new Date();
  const thisMonthStart = startOfMonth(today);
  const thisMonthEnd = endOfMonth(today);
  const lastMonthStart = startOfMonth(subMonths(today, 1));
  const lastMonthEnd = endOfMonth(subMonths(today, 1));
  
  // Get date range based on selected period
  const getDateRange = () => {
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
  
  const dateRange = getDateRange();
  
  // Filter transactions by selected period
  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = parseISO(transaction.date);
    return isWithinInterval(transactionDate, { 
      start: dateRange.start, 
      end: dateRange.end 
    });
  });
  
  // Calculate totals
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const netChange = totalIncome - totalExpenses;
  
  // Calculate total balance from accounts
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  
  // Get number of days for trend chart based on selected period
  const getTrendDays = () => {
    if (selectedPeriod === "thisMonth" || selectedPeriod === "lastMonth") {
      return 30;
    } else {
      const monthsAgo = parseInt(selectedPeriod.replace("months", ""));
      return monthsAgo * 30;
    }
  };
  
  return (
    <MainLayout>
      <Helmet>
        <title>Dashboard | ExpenseTrack</title>
      </Helmet>
      
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Your financial overview for {dateRange.label.toLowerCase()}
          </p>
        </div>
        
        <Select
          value={selectedPeriod}
          onValueChange={setSelectedPeriod}
        >
          <SelectTrigger className="w-[180px]">
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
      </div>
      
      <div className="space-y-8">
        <DashboardSummary 
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
          balance={totalBalance}
          netChange={netChange}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ExpenseByCategoryChart 
            transactions={filteredTransactions}
            categories={categories}
            period={dateRange.label.toLowerCase()}
          />
          
          <BudgetProgressList 
            budgets={budgets}
            categories={categories}
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <IncomeExpenseTrend 
            transactions={transactions}
            days={getTrendDays()}
          />
          
          <RecentTransactions 
            transactions={transactions}
            categories={categories}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
