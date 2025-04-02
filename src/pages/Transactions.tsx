
import { useState } from "react";
import { Helmet } from "react-helmet";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import TransactionList from "@/components/transactions/TransactionList";
import TransactionForm from "@/components/transactions/TransactionForm";
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
import { Transaction } from "@/types/finance";
import { useToast } from "@/components/ui/use-toast";

const Transactions = () => {
  const { transactions, categories, accounts, addTransaction, updateTransaction, deleteTransaction } = useFinanceData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  
  const handleOpenForm = (transaction?: Transaction) => {
    setSelectedTransaction(transaction || null);
    setIsFormOpen(true);
  };
  
  const handleCloseForm = () => {
    setSelectedTransaction(null);
    setIsFormOpen(false);
  };
  
  const handleSubmitForm = (data: Omit<Transaction, 'id'> | Transaction) => {
    if ('id' in data && data.id) {
      updateTransaction(data.id, data);
      toast({
        title: "Transaction updated",
        description: "Your transaction has been updated successfully",
      });
    } else {
      addTransaction(data);
      toast({
        title: "Transaction added",
        description: "Your transaction has been added successfully",
      });
    }
    
    handleCloseForm();
  };
  
  const handleDeleteClick = (id: string) => {
    setTransactionToDelete(id);
    setIsDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = () => {
    if (transactionToDelete) {
      deleteTransaction(transactionToDelete);
      setIsDeleteDialogOpen(false);
      setTransactionToDelete(null);
      
      toast({
        title: "Transaction deleted",
        description: "Your transaction has been deleted successfully",
      });
    }
  };
  
  return (
    <MainLayout>
      <Helmet>
        <title>Transactions | ExpenseTrack</title>
      </Helmet>
      
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            Manage your income and expenses
          </p>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>
                {selectedTransaction ? 'Edit Transaction' : 'Add New Transaction'}
              </DialogTitle>
            </DialogHeader>
            <TransactionForm
              initialData={selectedTransaction || undefined}
              categories={categories}
              accounts={accounts}
              onSubmit={handleSubmitForm}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <TransactionList
        transactions={transactions}
        categories={categories}
        accounts={accounts}
        onEdit={handleOpenForm}
        onDelete={handleDeleteClick}
      />
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the transaction.
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

export default Transactions;
