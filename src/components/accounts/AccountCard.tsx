
import { Account } from "@/types/finance";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, CreditCard, PiggyBank, LineChart, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AccountCardProps {
  account: Account;
  onEdit: (account: Account) => void;
  onDelete: (id: string) => void;
  transactionCount: number;
}

const AccountCard = ({ 
  account, 
  onEdit, 
  onDelete,
  transactionCount 
}: AccountCardProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };
  
  const getAccountIcon = () => {
    switch (account.type) {
      case 'checking':
        return <Wallet className="h-6 w-6" />;
      case 'savings':
        return <PiggyBank className="h-6 w-6" />;
      case 'credit':
        return <CreditCard className="h-6 w-6" />;
      case 'investment':
        return <LineChart className="h-6 w-6" />;
      default:
        return <Wallet className="h-6 w-6" />;
    }
  };
  
  const getAccountColor = () => {
    switch (account.type) {
      case 'checking':
        return 'bg-blue-100 text-blue-700';
      case 'savings':
        return 'bg-emerald-100 text-emerald-700';
      case 'credit':
        return 'bg-purple-100 text-purple-700';
      case 'investment':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardContent className="pt-6 flex-grow">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-lg">{account.name}</h3>
            <Badge 
              variant="outline" 
              className={cn("capitalize mt-1", getAccountColor())}
            >
              {account.type}
            </Badge>
          </div>
          <div className={cn(
            "p-3 rounded-full",
            getAccountColor()
          )}>
            {getAccountIcon()}
          </div>
        </div>
        
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">Current Balance</p>
          <p className="text-2xl font-bold">{formatCurrency(account.balance)}</p>
        </div>
        
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">{transactionCount} linked transactions</p>
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-3">
        <div className="flex w-full justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(account)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={transactionCount > 0}
            onClick={() => onDelete(account.id)}
            title={transactionCount > 0 ? "Cannot delete accounts with transactions" : "Delete account"}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AccountCard;
