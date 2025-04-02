
import { useState } from "react";
import { Helmet } from "react-helmet";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import BudgetCard from "@/components/budgets/BudgetCard";
import BudgetForm from "@/components/budgets/BudgetForm";
import useFinanceData from "@/hooks/useFinanceData";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Budget } from "@/types/finance";
import { useToast } from "@/components/ui/use-toast";

const Budgets = () => {
  const { budgets, categories, addBudget, updateBudget, deleteBudget, getCategoryById } = useFinanceData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [budgetToDelete, setBudgetToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  
  const handleOpenForm = (budget?: Budget) => {
    setSelectedBudget(budget || null);
    setIsFormOpen(true);
  };
  
  const handleCloseForm = () => {
    setSelectedBudget(null);
    setIsFormOpen(false);
  };
  
  const handleSubmitForm = (data: Omit<Budget, 'id'> | Budget) => {
    if ('id' in data && data.id) {
      updateBudget(data.id, data);
      toast({
        title: "Budget updated",
        description: "Your budget has been updated successfully",
      });
    } else {
      addBudget(data);
      toast({
        title: "Budget added",
        description: "Your budget has been added successfully",
      });
    }
    
    handleCloseForm();
  };
  
  const handleDeleteClick = (id: string) => {
    setBudgetToDelete(id);
    setIsDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = () => {
    if (budgetToDelete) {
      deleteBudget(budgetToDelete);
      setIsDeleteDialogOpen(false);
      setBudgetToDelete(null);
      
      toast({
        title: "Budget deleted",
        description: "Your budget has been deleted successfully",
      });
    }
  };
  
  return (
    <MainLayout>
      <Helmet>
        <title>Budgets | ExpenseTrack</title>
      </Helmet>
      
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground">
            Set and manage your spending limits
          </p>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Budget
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>
                {selectedBudget ? 'Edit Budget' : 'Add New Budget'}
              </DialogTitle>
            </DialogHeader>
            <BudgetForm
              initialData={selectedBudget || undefined}
              categories={categories.filter(c => c.type === 'expense')}
              onSubmit={handleSubmitForm}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.length > 0 ? (
          budgets.map(budget => {
            const category = getCategoryById(budget.category);
            return (
              <BudgetCard
                key={budget.id}
                budget={budget}
                category={category!}
                onEdit={handleOpenForm}
                onDelete={handleDeleteClick}
              />
            );
          })
        ) : (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <p className="text-lg mb-2">No budgets created yet</p>
            <p>Create a budget to start tracking your spending limits</p>
          </div>
        )}
      </div>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the budget.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default Budgets;
