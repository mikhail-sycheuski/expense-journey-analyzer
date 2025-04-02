
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Budget, Category } from "@/types/finance";
import { format, addMonths, startOfMonth, endOfMonth } from "date-fns";
import { DialogClose } from "@/components/ui/dialog";

interface BudgetFormProps {
  initialData?: Budget;
  categories: Category[];
  onSubmit: (data: Omit<Budget, 'id'> | Budget) => void;
}

const BudgetForm = ({ 
  initialData,
  categories,
  onSubmit 
}: BudgetFormProps) => {
  const today = new Date();
  const defaultStartDate = format(startOfMonth(today), 'yyyy-MM-dd');
  const defaultEndDate = format(endOfMonth(today), 'yyyy-MM-dd');
  
  const [formData, setFormData] = useState<Omit<Budget, 'id'> | Budget>({
    name: '',
    amount: 0,
    spent: 0,
    period: 'monthly',
    category: '',
    startDate: defaultStartDate,
    endDate: defaultEndDate,
    id: initialData?.id || ''
  });
  
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);
  
  useEffect(() => {
    if (formData.period && !initialData) {
      let endDate = today;
      
      // Set the date range based on the period
      if (formData.period === 'weekly') {
        endDate = new Date(today);
        endDate.setDate(today.getDate() + 6);
      } else if (formData.period === 'monthly') {
        endDate = endOfMonth(today);
      } else if (formData.period === 'yearly') {
        endDate = endOfMonth(addMonths(today, 11));
      }
      
      setFormData({
        ...formData,
        startDate: format(startOfMonth(today), 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd')
      });
    }
  }, [formData.period, initialData]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'amount' ? parseFloat(value) : value
    });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Filter for expense categories only
  const expenseCategories = categories.filter(c => c.type === 'expense');
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Budget Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Monthly Groceries"
          required
        />
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="amount">Budget Amount</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={value => handleSelectChange('category', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {expenseCategories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="period">Budget Period</Label>
        <Select
          value={formData.period}
          onValueChange={value => handleSelectChange('period', value as 'weekly' | 'monthly' | 'yearly')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            name="endDate"
            type="date"
            value={formData.endDate}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <DialogClose asChild>
          <Button variant="outline" type="button">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit">
          {initialData ? 'Update' : 'Create'} Budget
        </Button>
      </div>
    </form>
  );
};

export default BudgetForm;
