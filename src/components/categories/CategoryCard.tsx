
import { Category } from "@/types/finance";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, BarChart2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  transactionCount: number;
}

const CategoryCard = ({ 
  category, 
  onEdit, 
  onDelete,
  transactionCount 
}: CategoryCardProps) => {
  const navigate = useNavigate();
  
  return (
    <Card className="flex items-center justify-between p-4">
      <div className="flex items-center space-x-3">
        <div 
          className="w-3 h-12 rounded-full"
          style={{ backgroundColor: category.color }}
        />
        <div>
          <h3 className="font-medium text-lg">{category.name}</h3>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={cn(
                "capitalize",
                category.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
              )}
            >
              {category.type}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {transactionCount} transactions
            </span>
          </div>
        </div>
      </div>
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/categories/${category.id}`)}
          disabled={transactionCount === 0}
          title={transactionCount === 0 ? "No transactions for this category" : "View category details"}
        >
          <BarChart2 className="h-4 w-4 mr-1" />
          Details
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(category)}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={transactionCount > 0}
          onClick={() => onDelete(category.id)}
          title={transactionCount > 0 ? "Cannot delete categories with transactions" : "Delete category"}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

export default CategoryCard;
