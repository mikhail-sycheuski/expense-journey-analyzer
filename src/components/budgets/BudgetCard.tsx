
import { Budget, Category } from "@/types/finance";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

interface BudgetCardProps {
  budget: Budget;
  category: Category;
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
}

const BudgetCard = ({ budget, category, onEdit, onDelete }: BudgetCardProps) => {
  const percentage = Math.min(100, Math.round((budget.spent / budget.amount) * 100));
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };
  
  const getStatusInfo = () => {
    if (percentage >= 100) {
      return {
        label: 'Budget Exceeded',
        color: 'text-rose-500',
        progressColor: 'bg-rose-500'
      };
    } else if (percentage >= 85) {
      return {
        label: 'Almost Reached',
        color: 'text-amber-500',
        progressColor: 'bg-amber-500'
      };
    } else if (percentage >= 50) {
      return {
        label: 'Half Spent',
        color: 'text-blue-500',
        progressColor: 'bg-blue-500'
      };
    } else {
      return {
        label: 'On Track',
        color: 'text-emerald-500',
        progressColor: 'bg-emerald-500'
      };
    }
  };
  
  const status = getStatusInfo();
  
  return (
    <Card className="h-full flex flex-col">
      <CardContent className="pt-6 flex-grow">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-lg">{budget.name}</h3>
            <p 
              className="text-sm font-medium" 
              style={{ color: category?.color || '#6b7280' }}
            >
              {category?.name || 'Uncategorized'}
            </p>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg">
              {formatCurrency(budget.spent)} <span className="text-muted-foreground font-normal text-sm">of {formatCurrency(budget.amount)}</span>
            </p>
            <p className={cn("text-sm font-medium", status.color)}>
              {percentage}% used
            </p>
          </div>
        </div>
        
        <Progress 
          value={percentage} 
          className={cn("h-2 mb-3", status.progressColor)}
        />
        
        <div className="text-sm text-muted-foreground mt-2">
          <p className="flex justify-between">
            <span>Period:</span>
            <span className="font-medium capitalize">{budget.period}</span>
          </p>
          <p className="flex justify-between">
            <span>Date Range:</span>
            <span className="font-medium">
              {format(parseISO(budget.startDate), 'MMM d')} - {format(parseISO(budget.endDate), 'MMM d, yyyy')}
            </span>
          </p>
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-3">
        <div className="flex w-full justify-between">
          <p className={cn("text-sm font-medium", status.color)}>
            {status.label}
          </p>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(budget)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(budget.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default BudgetCard;
