
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight, DollarSign, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardSummaryProps {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  netChange: number;
}

const DashboardSummary = ({ totalIncome, totalExpenses, balance, netChange }: DashboardSummaryProps) => {
  const isPositiveChange = netChange >= 0;
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(balance)}</div>
          <p className="text-xs text-muted-foreground">
            Current balance across all accounts
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Income</CardTitle>
          <ArrowUpRight className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-500">{formatCurrency(totalIncome)}</div>
          <p className="text-xs text-muted-foreground">
            Total income this month
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Expenses</CardTitle>
          <ArrowDownRight className="h-4 w-4 text-rose-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-rose-500">{formatCurrency(totalExpenses)}</div>
          <p className="text-xs text-muted-foreground">
            Total expenses this month
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Change</CardTitle>
          <DollarSign className={cn("h-4 w-4", isPositiveChange ? "text-emerald-500" : "text-rose-500")} />
        </CardHeader>
        <CardContent>
          <div className={cn("text-2xl font-bold", isPositiveChange ? "text-emerald-500" : "text-rose-500")}>
            {isPositiveChange ? "+" : ""}{formatCurrency(netChange)}
          </div>
          <p className="text-xs text-muted-foreground">
            {isPositiveChange ? "Surplus" : "Deficit"} for this month
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardSummary;
