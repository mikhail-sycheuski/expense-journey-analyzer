
import { useState } from "react";
import { Transaction, Category, Account } from "@/types/finance";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { format, parseISO } from "date-fns";
import { Edit2, Trash2, ArrowUpRight, ArrowDownRight, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

const TransactionList = ({ 
  transactions, 
  categories, 
  accounts,
  onEdit, 
  onDelete 
}: TransactionListProps) => {
  const [filter, setFilter] = useState<{
    type: string;
    category: string;
    account: string;
    search: string;
  }>({
    type: "",
    category: "",
    account: "",
    search: "",
  });
  
  const formatCurrency = (value: number, type: 'income' | 'expense') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(type === 'expense' ? -value : value);
  };
  
  const getCategoryById = (id: string) => {
    return categories.find(c => c.id === id);
  };
  
  const getAccountById = (id: string) => {
    return accounts.find(a => a.id === id);
  };
  
  // Apply filters to transactions
  const filteredTransactions = transactions.filter(transaction => {
    // Filter by type
    if (filter.type && transaction.type !== filter.type) {
      return false;
    }
    
    // Filter by category
    if (filter.category && transaction.category !== filter.category) {
      return false;
    }
    
    // Filter by account
    if (filter.account && transaction.account !== filter.account) {
      return false;
    }
    
    // Filter by search term (description)
    if (filter.search && !transaction.description.toLowerCase().includes(filter.search.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // Sort transactions by date (newest first)
  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 pb-4">
        <div className="flex flex-1 gap-2">
          <Input
            placeholder="Search transactions..."
            value={filter.search}
            onChange={e => setFilter({ ...filter, search: e.target.value })}
            className="max-w-xs"
          />
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setFilter({ type: "", category: "", account: "", search: "" })}
            className="shrink-0"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select
            value={filter.type}
            onValueChange={value => setFilter({ ...filter, type: value })}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={filter.category}
            onValueChange={value => setFilter({ ...filter, category: value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={filter.account}
            onValueChange={value => setFilter({ ...filter, account: value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Accounts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Accounts</SelectItem>
              {accounts.map(account => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Transactions Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Account</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[100px] text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTransactions.length > 0 ? (
              sortedTransactions.map(transaction => {
                const category = getCategoryById(transaction.category);
                const account = getAccountById(transaction.account);
                
                return (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {format(parseISO(transaction.date), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {transaction.type === "income" ? (
                          <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-rose-500" />
                        )}
                        <span>{transaction.description}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {category && (
                        <Badge 
                          className="font-normal" 
                          style={{ 
                            backgroundColor: category.color,
                            color: '#fff'
                          }}
                        >
                          {category.name}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {account?.name}
                    </TableCell>
                    <TableCell className={cn(
                      "text-right font-medium",
                      transaction.type === "income" ? "text-emerald-500" : "text-rose-500"
                    )}>
                      {formatCurrency(transaction.amount, transaction.type)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(transaction)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(transaction.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                  No transactions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TransactionList;
