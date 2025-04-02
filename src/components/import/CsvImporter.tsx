
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { UploadCloud, FileText, Check, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { Transaction, Category, Account } from "@/types/finance";

interface CsvImporterProps {
  onImport: (transactions: Omit<Transaction, 'id'>[]) => void;
  categories: Category[];
  accounts: Account[];
}

const CsvImporter = ({ onImport, categories, accounts }: CsvImporterProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith('.csv')) {
        toast({
          title: "Invalid file type",
          description: "Please upload a CSV file",
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };
  
  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };
  
  const parseCsvToTransactions = (csvContent: string): Omit<Transaction, 'id'>[] => {
    const lines = csvContent.split('\n');
    if (lines.length <= 1) {
      throw new Error('CSV file appears to be empty or contains only headers');
    }
    
    const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
    
    // Check required headers
    const requiredHeaders = ['date', 'description', 'amount'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      throw new Error(`CSV is missing required headers: ${missingHeaders.join(', ')}`);
    }
    
    // Map indices
    const dateIndex = headers.indexOf('date');
    const descriptionIndex = headers.indexOf('description');
    const amountIndex = headers.indexOf('amount');
    const categoryIndex = headers.indexOf('category');
    const typeIndex = headers.indexOf('type');
    const accountIndex = headers.indexOf('account');
    
    const defaultAccount = accounts.length > 0 ? accounts[0].id : '';
    
    const transactions: Omit<Transaction, 'id'>[] = [];
    
    // Process each line
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue; // Skip empty lines
      
      const values = lines[i].split(',').map(value => value.trim());
      
      if (values.length < 3) continue; // Skip lines with insufficient data
      
      // Parse the amount
      let amount = Math.abs(parseFloat(values[amountIndex]));
      
      // Determine transaction type
      let type: 'income' | 'expense';
      if (typeIndex !== -1) {
        // If type is explicitly specified
        type = values[typeIndex].toLowerCase() === 'income' ? 'income' : 'expense';
      } else {
        // Infer from amount (negative = expense, positive = income)
        const rawAmount = parseFloat(values[amountIndex]);
        type = rawAmount < 0 ? 'expense' : 'income';
      }
      
      // Find matching category if provided
      let categoryId = '';
      if (categoryIndex !== -1 && values[categoryIndex]) {
        const categoryName = values[categoryIndex].toLowerCase();
        const matchingCategory = categories.find(c => 
          c.name.toLowerCase() === categoryName && c.type === type
        );
        
        if (matchingCategory) {
          categoryId = matchingCategory.id;
        } else {
          // Default to the first category of matching type
          const defaultCategory = categories.find(c => c.type === type);
          if (defaultCategory) {
            categoryId = defaultCategory.id;
          }
        }
      } else {
        // Default to the first category of matching type
        const defaultCategory = categories.find(c => c.type === type);
        if (defaultCategory) {
          categoryId = defaultCategory.id;
        }
      }
      
      // Find matching account if provided
      let accountId = defaultAccount;
      if (accountIndex !== -1 && values[accountIndex]) {
        const accountName = values[accountIndex].toLowerCase();
        const matchingAccount = accounts.find(a => 
          a.name.toLowerCase() === accountName
        );
        
        if (matchingAccount) {
          accountId = matchingAccount.id;
        }
      }
      
      // Create transaction object
      const transaction: Omit<Transaction, 'id'> = {
        date: values[dateIndex],
        description: values[descriptionIndex],
        amount,
        category: categoryId,
        type,
        account: accountId
      };
      
      transactions.push(transaction);
      
      // Update progress
      setProgress(Math.round((i / (lines.length - 1)) * 100));
    }
    
    return transactions;
  };
  
  const handleImport = () => {
    if (!file) return;
    
    setIsProcessing(true);
    setProgress(0);
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const csvContent = event.target?.result as string;
        const transactions = parseCsvToTransactions(csvContent);
        
        if (transactions.length === 0) {
          toast({
            title: "No valid transactions found",
            description: "The CSV file did not contain any valid transaction data",
            variant: "destructive",
          });
          setIsProcessing(false);
          return;
        }
        
        // Process successful, call the onImport callback
        onImport(transactions);
        
        toast({
          title: "Import successful",
          description: `${transactions.length} transactions have been imported`,
          variant: "default",
        });
        
        // Reset the form
        setFile(null);
        setProgress(100);
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error("Error parsing CSV:", error);
        toast({
          title: "Import failed",
          description: error instanceof Error ? error.message : "An unknown error occurred",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    };
    
    reader.onerror = () => {
      toast({
        title: "Import failed",
        description: "Error reading the file",
        variant: "destructive",
      });
      setIsProcessing(false);
    };
    
    reader.readAsText(file);
  };
  
  return (
    <div className="space-y-6">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv"
        className="hidden"
      />
      
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          file ? 'border-primary' : 'border-muted-foreground/25'
        }`}
        onClick={!isProcessing ? handleSelectFile : undefined}
      >
        {file ? (
          <div className="flex flex-col items-center">
            <div className="p-3 rounded-full bg-primary/10 text-primary mb-4">
              <FileText size={32} />
            </div>
            <p className="text-lg font-medium">{file.name}</p>
            <p className="text-sm text-muted-foreground">
              {(file.size / 1024).toFixed(2)} KB • CSV
            </p>
            {!isProcessing && (
              <Button 
                variant="link" 
                className="mt-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
              >
                Remove file
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="p-3 rounded-full bg-muted mb-4">
              <UploadCloud size={32} className="text-muted-foreground" />
            </div>
            <p className="text-lg font-medium">Click to upload a CSV file</p>
            <p className="text-sm text-muted-foreground mt-1">
              or drag and drop a file here
            </p>
          </div>
        )}
      </div>
      
      {isProcessing && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Processing file...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
      )}
      
      <Button
        onClick={handleImport}
        disabled={!file || isProcessing}
        className="w-full"
      >
        {isProcessing ? 'Processing...' : 'Import Transactions'}
      </Button>
      
      <Separator />
      
      <div className="space-y-4">
        <h3 className="font-medium">CSV Format Requirements</h3>
        
        <div className="grid gap-2">
          <div className="flex items-start gap-2">
            <Check className="h-5 w-5 text-emerald-500 mt-0.5" />
            <p className="text-sm">
              <span className="font-medium">Required columns:</span> date, description, amount
            </p>
          </div>
          
          <div className="flex items-start gap-2">
            <Check className="h-5 w-5 text-emerald-500 mt-0.5" />
            <p className="text-sm">
              <span className="font-medium">Optional columns:</span> category, type (income/expense), account
            </p>
          </div>
          
          <div className="flex items-start gap-2">
            <Check className="h-5 w-5 text-emerald-500 mt-0.5" />
            <p className="text-sm">
              <span className="font-medium">Date format:</span> YYYY-MM-DD
            </p>
          </div>
          
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
            <p className="text-sm">
              If the CSV has other formats, the import might not work correctly.
            </p>
          </div>
        </div>
        
        <div className="bg-muted p-3 rounded-md">
          <p className="text-sm font-medium mb-1">Example CSV Format:</p>
          <pre className="text-xs overflow-x-auto">
            date,description,amount,category,type,account<br/>
            2023-07-01,Grocery Store,-45.99,Groceries,expense,Checking<br/>
            2023-07-02,Salary Deposit,2500.00,Salary,income,Savings
          </pre>
        </div>
      </div>
    </div>
  );
};

export default CsvImporter;
