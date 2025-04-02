
import { useState } from "react";
import { Helmet } from "react-helmet";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import AccountCard from "@/components/accounts/AccountCard";
import AccountForm from "@/components/accounts/AccountForm";
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
import { Account } from "@/types/finance";
import { useToast } from "@/components/ui/use-toast";

const Accounts = () => {
  const { transactions, accounts, addAccount, updateAccount, deleteAccount } = useFinanceData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  
  const handleOpenForm = (account?: Account) => {
    setSelectedAccount(account || null);
    setIsFormOpen(true);
  };
  
  const handleCloseForm = () => {
    setSelectedAccount(null);
    setIsFormOpen(false);
  };
  
  const handleSubmitForm = (data: Omit<Account, 'id'> | Account) => {
    try {
      if ('id' in data && data.id) {
        updateAccount(data.id, data);
        toast({
          title: "Account updated",
          description: "Your account has been updated successfully",
        });
      } else {
        addAccount(data);
        toast({
          title: "Account added",
          description: "Your account has been added successfully",
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
    setAccountToDelete(id);
    setIsDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = () => {
    if (accountToDelete) {
      try {
        deleteAccount(accountToDelete);
        setIsDeleteDialogOpen(false);
        setAccountToDelete(null);
        
        toast({
          title: "Account deleted",
          description: "Your account has been deleted successfully",
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
  
  // Count transactions per account
  const getTransactionCount = (accountId: string) => {
    return transactions.filter(t => t.account === accountId).length;
  };
  
  return (
    <MainLayout>
      <Helmet>
        <title>Accounts | ExpenseTrack</title>
      </Helmet>
      
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
          <p className="text-muted-foreground">
            Manage your bank and financial accounts
          </p>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {selectedAccount ? 'Edit Account' : 'Add New Account'}
              </DialogTitle>
            </DialogHeader>
            <AccountForm
              initialData={selectedAccount || undefined}
              onSubmit={handleSubmitForm}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.length > 0 ? (
          accounts.map(account => (
            <AccountCard
              key={account.id}
              account={account}
              onEdit={handleOpenForm}
              onDelete={handleDeleteClick}
              transactionCount={getTransactionCount(account.id)}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <p className="text-lg mb-2">No accounts created yet</p>
            <p>Add your financial accounts to start tracking transactions</p>
          </div>
        )}
      </div>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Accounts with associated transactions cannot be deleted.
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

export default Accounts;
