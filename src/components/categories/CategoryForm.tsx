
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
import { Category } from "@/types/finance";
import { DialogClose } from "@/components/ui/dialog";

// Predefined color options
const colorOptions = [
  { value: "#ef4444", name: "Red" },
  { value: "#f97316", name: "Orange" },
  { value: "#f59e0b", name: "Amber" },
  { value: "#10b981", name: "Emerald" },
  { value: "#14b8a6", name: "Teal" },
  { value: "#3b82f6", name: "Blue" },
  { value: "#6366f1", name: "Indigo" },
  { value: "#8b5cf6", name: "Purple" },
  { value: "#ec4899", name: "Pink" },
  { value: "#6b7280", name: "Gray" },
];

interface CategoryFormProps {
  initialData?: Category;
  onSubmit: (data: Omit<Category, 'id'> | Category) => void;
}

const CategoryForm = ({ 
  initialData,
  onSubmit 
}: CategoryFormProps) => {
  const [formData, setFormData] = useState<Omit<Category, 'id'> | Category>({
    name: '',
    color: colorOptions[0].value,
    type: 'expense',
    id: initialData?.id || ''
  });
  
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Category Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Groceries"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <Select
          value={formData.type}
          onValueChange={value => handleSelectChange('type', value as 'income' | 'expense')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="color">Color</Label>
        <div className="grid grid-cols-5 gap-2">
          {colorOptions.map(color => (
            <button
              key={color.value}
              type="button"
              className={`w-full h-10 rounded-md border-2 ${formData.color === color.value ? 'border-black dark:border-white' : 'border-transparent'}`}
              style={{ backgroundColor: color.value }}
              onClick={() => handleSelectChange('color', color.value)}
              title={color.name}
            />
          ))}
        </div>
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <DialogClose asChild>
          <Button variant="outline" type="button">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit">
          {initialData ? 'Update' : 'Create'} Category
        </Button>
      </div>
    </form>
  );
};

export default CategoryForm;
