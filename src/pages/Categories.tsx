
import { useState } from "react";
import { Helmet } from "react-helmet";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import CategoryCard from "@/components/categories/CategoryCard";
import CategoryForm from "@/components/categories/CategoryForm";
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
import { Category } from "@/types/finance";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Categories = () => {
  const { transactions, categories, addCategory, updateCategory, deleteCategory } = useFinanceData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  
  const handleOpenForm = (category?: Category) => {
    setSelectedCategory(category || null);
    setIsFormOpen(true);
  };
  
  const handleCloseForm = () => {
    setSelectedCategory(null);
    setIsFormOpen(false);
  };
  
  const handleSubmitForm = (data: Omit<Category, 'id'> | Category) => {
    try {
      if ('id' in data && data.id) {
        updateCategory(data.id, data);
        toast({
          title: "Category updated",
          description: "Your category has been updated successfully",
        });
      } else {
        addCategory(data);
        toast({
          title: "Category added",
          description: "Your category has been added successfully",
        });
      }
      
      handleCloseForm();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteClick = (id: string) => {
    setCategoryToDelete(id);
    setIsDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      try {
        deleteCategory(categoryToDelete);
        setIsDeleteDialogOpen(false);
        setCategoryToDelete(null);
        
        toast({
          title: "Category deleted",
          description: "Your category has been deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "An unknown error occurred",
          variant: "destructive",
        });
        setIsDeleteDialogOpen(false);
      }
    }
  };
  
  // Count transactions per category
  const getTransactionCount = (categoryId: string) => {
    return transactions.filter(t => t.category === categoryId).length;
  };
  
  // Filter categories by type
  const expenseCategories = categories.filter(c => c.type === 'expense');
  const incomeCategories = categories.filter(c => c.type === 'income');
  
  return (
    <MainLayout>
      <Helmet>
        <title>Categories | ExpenseTrack</title>
      </Helmet>
      
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Manage your transaction categories
          </p>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {selectedCategory ? 'Edit Category' : 'Add New Category'}
              </DialogTitle>
            </DialogHeader>
            <CategoryForm
              initialData={selectedCategory || undefined}
              onSubmit={handleSubmitForm}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="expense" className="space-y-4">
        <TabsList>
          <TabsTrigger value="expense">Expense Categories</TabsTrigger>
          <TabsTrigger value="income">Income Categories</TabsTrigger>
        </TabsList>
        
        <TabsContent value="expense" className="space-y-4">
          {expenseCategories.length > 0 ? (
            expenseCategories.map(category => (
              <CategoryCard
                key={category.id}
                category={category}
                onEdit={handleOpenForm}
                onDelete={handleDeleteClick}
                transactionCount={getTransactionCount(category.id)}
              />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No expense categories found. Create one to get started.
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="income" className="space-y-4">
          {incomeCategories.length > 0 ? (
            incomeCategories.map(category => (
              <CategoryCard
                key={category.id}
                category={category}
                onEdit={handleOpenForm}
                onDelete={handleDeleteClick}
                transactionCount={getTransactionCount(category.id)}
              />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No income categories found. Create one to get started.
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Categories with associated transactions cannot be deleted.
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

export default Categories;
