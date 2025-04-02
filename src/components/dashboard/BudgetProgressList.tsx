
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Budget, Category } from "@/types/finance";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface BudgetProgressListProps {
  budgets: Budget[];
  categories: Category[];
}

const BudgetProgressList = ({ budgets, categories }: BudgetProgressListProps) => {
  const navigate = useNavigate();
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };
  
  // Sort budgets by percentage spent (highest first)
  const sortedBudgets = [...budgets]
    .sort((a, b) => (b.spent / b.amount) - (a.spent / a.amount));
  
  // Get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Uncategorized';
  };
  
  const getBudgetStatus = (budget: Budget) => {
    const percentage = (budget.spent / budget.amount) * 100;
    
    if (percentage >= 100) {
      return { label: 'Exceeded', color: 'text-rose-500', progressColor: 'bg-rose-500' };
    } else if (percentage >= 85) {
      return { label: 'Warning', color: 'text-amber-500', progressColor: 'bg-amber-500' };
    } else {
      return { label: 'On Track', color: 'text-emerald-500', progressColor: 'bg-emerald-500' };
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Budget Progress</CardTitle>
          <CardDescription>Track your spending against budget categories</CardDescription>
        </div>
        <Button 
          variant="outline"
          onClick={() => navigate('/budgets')}
        >
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedBudgets.length > 0 ? (
            sortedBudgets.slice(0, 4).map(budget => {
              const percentage = Math.round((budget.spent / budget.amount) * 100);
              const status = getBudgetStatus(budget);
              
              return (
                <div key={budget.id} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{getCategoryName(budget.category)}</span>
                    <span className={cn("font-medium", status.color)}>
                      {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                    </span>
                  </div>
                  <Progress className="h-2" value={Math.min(percentage, 100)} />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{percentage}% used</span>
                    <span className={status.color}>{status.label}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No budgets have been created yet
            </div>
          )}
          
          {budgets.length > 4 && (
            <div className="text-center text-sm text-muted-foreground">
              +{budgets.length - 4} more budgets
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetProgressList;
