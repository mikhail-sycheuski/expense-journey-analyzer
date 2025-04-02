
import useLocalStorage from './useLocalStorage';
import { Transaction, Category, Budget, Account } from '@/types/finance';
import { defaultCategories, mockTransactions, mockBudgets, mockAccounts } from '@/data/mockData';
import { useState, useEffect } from 'react';

interface FinanceData {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  accounts: Account[];
  
  // Transactions
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  
  // Categories
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  
  // Budgets
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  
  // Accounts
  addAccount: (account: Omit<Account, 'id'>) => void;
  updateAccount: (id: string, account: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  
  // Data import
  importTransactions: (newTransactions: Omit<Transaction, 'id'>[]) => void;
  getCategoryById: (id: string) => Category | undefined;
}

const useFinanceData = (): FinanceData => {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', mockTransactions);
  const [categories, setCategories] = useLocalStorage<Category[]>('categories', defaultCategories);
  const [budgets, setBudgets] = useLocalStorage<Budget[]>('budgets', mockBudgets);
  const [accounts, setAccounts] = useLocalStorage<Account[]>('accounts', mockAccounts);
  
  // Update budget spent amounts based on transactions
  useEffect(() => {
    const updatedBudgets = budgets.map(budget => {
      const categoryTransactions = transactions.filter(
        t => t.category === budget.category &&
        t.type === 'expense' &&
        new Date(t.date) >= new Date(budget.startDate) &&
        new Date(t.date) <= new Date(budget.endDate)
      );
      
      const spent = categoryTransactions.reduce((total, t) => total + t.amount, 0);
      
      return {
        ...budget,
        spent
      };
    });
    
    setBudgets(updatedBudgets);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions]);
  
  // Generate a unique ID
  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);
  
  // Transactions
  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...transaction, id: generateId() };
    setTransactions([...transactions, newTransaction]);
  };
  
  const updateTransaction = (id: string, transaction: Partial<Transaction>) => {
    setTransactions(
      transactions.map(t => (t.id === id ? { ...t, ...transaction } : t))
    );
  };
  
  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };
  
  // Categories
  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory = { ...category, id: generateId() };
    setCategories([...categories, newCategory]);
  };
  
  const updateCategory = (id: string, category: Partial<Category>) => {
    setCategories(
      categories.map(c => (c.id === id ? { ...c, ...category } : c))
    );
  };
  
  const deleteCategory = (id: string) => {
    // Don't delete categories that have transactions
    const hasTransactions = transactions.some(t => t.category === id);
    if (hasTransactions) {
      throw new Error("Cannot delete a category that has transactions");
    }
    
    setCategories(categories.filter(c => c.id !== id));
  };
  
  // Budgets
  const addBudget = (budget: Omit<Budget, 'id'>) => {
    const newBudget = { ...budget, id: generateId() };
    setBudgets([...budgets, newBudget]);
  };
  
  const updateBudget = (id: string, budget: Partial<Budget>) => {
    setBudgets(
      budgets.map(b => (b.id === id ? { ...b, ...budget } : b))
    );
  };
  
  const deleteBudget = (id: string) => {
    setBudgets(budgets.filter(b => b.id !== id));
  };
  
  // Accounts
  const addAccount = (account: Omit<Account, 'id'>) => {
    const newAccount = { ...account, id: generateId() };
    setAccounts([...accounts, newAccount]);
  };
  
  const updateAccount = (id: string, account: Partial<Account>) => {
    setAccounts(
      accounts.map(a => (a.id === id ? { ...a, ...account } : a))
    );
  };
  
  const deleteAccount = (id: string) => {
    // Don't delete accounts that have transactions
    const hasTransactions = transactions.some(t => t.account === id);
    if (hasTransactions) {
      throw new Error("Cannot delete an account that has transactions");
    }
    
    setAccounts(accounts.filter(a => a.id !== id));
  };
  
  // Import transactions
  const importTransactions = (newTransactions: Omit<Transaction, 'id'>[]) => {
    const transactionsWithIds = newTransactions.map(t => ({
      ...t,
      id: generateId()
    }));
    
    setTransactions([...transactions, ...transactionsWithIds]);
  };
  
  // Helper function to get category by ID
  const getCategoryById = (id: string) => {
    return categories.find(category => category.id === id);
  };
  
  return {
    transactions,
    categories,
    budgets,
    accounts,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    addBudget,
    updateBudget,
    deleteBudget,
    addAccount,
    updateAccount,
    deleteAccount,
    importTransactions,
    getCategoryById
  };
};

export default useFinanceData;
