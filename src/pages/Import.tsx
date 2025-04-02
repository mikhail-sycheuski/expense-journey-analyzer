
import { Helmet } from "react-helmet";
import MainLayout from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CsvImporter from "@/components/import/CsvImporter";
import useFinanceData from "@/hooks/useFinanceData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUp } from "lucide-react";

const Import = () => {
  const { categories, accounts, importTransactions } = useFinanceData();
  
  return (
    <MainLayout>
      <Helmet>
        <title>Import Data | ExpenseTrack</title>
      </Helmet>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Import Data</h1>
        <p className="text-muted-foreground">
          Import your transaction data from your bank or financial service
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="p-2 rounded-md bg-blue-100">
              <FileUp className="h-6 w-6 text-finance-blue" />
            </div>
            <div>
              <CardTitle>CSV Import</CardTitle>
              <CardDescription>
                Upload CSV files exported from your bank
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Import your transaction data from CSV files. Make sure your CSV file includes date, description, and amount columns.
            </p>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Ready to Import?</CardTitle>
            <CardDescription>
              Choose an import method from the options below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              Importing your transactions makes it easier to:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
              <li>Track all your spending in one place</li>
              <li>Categorize transactions automatically</li>
              <li>Generate accurate reports and insights</li>
              <li>Keep your budget up-to-date</li>
            </ul>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="csv" className="space-y-6">
        <TabsList>
          <TabsTrigger value="csv">CSV Upload</TabsTrigger>
          <TabsTrigger value="bank" disabled>Bank Connection (Coming Soon)</TabsTrigger>
        </TabsList>
        
        <TabsContent value="csv">
          <Card>
            <CardHeader>
              <CardTitle>CSV File Import</CardTitle>
              <CardDescription>
                Upload a CSV file exported from your bank or financial institution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CsvImporter 
                onImport={importTransactions}
                categories={categories}
                accounts={accounts}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bank">
          <Card>
            <CardHeader>
              <CardTitle>Bank Connection</CardTitle>
              <CardDescription>
                Securely connect to your bank for automatic transaction import
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-12 text-center text-muted-foreground">
                <p className="text-lg font-medium mb-2">Coming Soon</p>
                <p>
                  Direct bank connection functionality is currently under development.
                  Please use CSV import for now.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default Import;
