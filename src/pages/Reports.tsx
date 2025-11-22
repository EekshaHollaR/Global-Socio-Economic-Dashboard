import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, Download, FileSpreadsheet, FileBarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { DataLoader } from '@/lib/dataLoader';
import { exportToCSV, exportToXLSX } from '@/utils/exportData';
import ExportDataModal from '@/components/ExportDataModal';

const Reports = () => {
  const [economicData, setEconomicData] = useState<any[]>([]);
  const [foodData, setFoodData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [economic, food] = await Promise.all([
        DataLoader.loadEconomicData(),
        DataLoader.loadFoodData(),
      ]);
      setEconomicData(economic);
      setFoodData(food);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error Loading Data',
        description: 'Failed to load dataset. Please refresh the page.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickExport = (dataType: 'economic' | 'food', format: 'csv' | 'excel') => {
    try {
      const data = dataType === 'economic' ? economicData : foodData;
      const filename = `${dataType}_data_fullset`;

      if (format === 'csv') {
        exportToCSV(data, filename);
      } else {
        exportToXLSX(data, filename);
      }

      toast({
        title: 'Export Successful',
        description: `${dataType.charAt(0).toUpperCase() + dataType.slice(1)} data exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export data. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 space-y-8">
        {/* Header */}
        <section className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-4xl font-bold text-foreground">
                Reports & Data Export
              </h1>
              <p className="text-lg text-muted-foreground">
                Download comprehensive datasets and generate custom reports
              </p>
            </div>
          </div>
        </section>

        {/* Quick Export Section */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Economic Data Export */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileBarChart className="h-5 w-5 text-primary" />
                <CardTitle>Economic Data Export</CardTitle>
              </div>
              <CardDescription>
                Complete economic indicators dataset (2000-2024)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div>
                  <p className="font-semibold">Indicators:</p>
                  <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                    <li>GDP Growth</li>
                    <li>Inflation Rate</li>
                    <li>Unemployment</li>
                    <li>Trade Balance</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold">Coverage:</p>
                  <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                    <li>190+ Countries</li>
                    <li>25 Years (2000-2024)</li>
                    <li>8 Key Metrics</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  className="w-full"
                  onClick={() => handleQuickExport('economic', 'excel')}
                  disabled={loading || economicData.length === 0}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Download as Excel (.xlsx)
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleQuickExport('economic', 'csv')}
                  disabled={loading || economicData.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download as CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Food Data Export */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileBarChart className="h-5 w-5 text-primary" />
                <CardTitle>Food Security Data Export</CardTitle>
              </div>
              <CardDescription>
                Complete food security indicators dataset (2000-2024)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div>
                  <p className="font-semibold">Indicators:</p>
                  <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                    <li>Cereal Yield</li>
                    <li>Food Imports</li>
                    <li>Production Index</li>
                    <li>Population Growth</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold">Coverage:</p>
                  <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                    <li>190+ Countries</li>
                    <li>25 Years (2000-2024)</li>
                    <li>8 Key Metrics</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  className="w-full"
                  onClick={() => handleQuickExport('food', 'excel')}
                  disabled={loading || foodData.length === 0}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Download as Excel (.xlsx)
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleQuickExport('food', 'csv')}
                  disabled={loading || foodData.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download as CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Custom Export Section */}
        <Card>
          <CardHeader>
            <CardTitle>Custom Data Export</CardTitle>
            <CardDescription>
              Configure and download filtered datasets with specific years and data types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              size="lg"
              className="w-full"
              onClick={() => setShowExportModal(true)}
              disabled={loading || (economicData.length === 0 && foodData.length === 0)}
            >
              <Download className="mr-2 h-5 w-5" />
              Open Custom Export Tool
            </Button>
          </CardContent>
        </Card>

        {/* Methodology Section */}
        <Card>
          <CardHeader>
            <CardTitle>Dataset Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Data Sources
              </h3>
              <p className="text-sm text-muted-foreground">
                Data compiled from World Bank Open Data, Food and Agriculture Organization (FAO),
                International Monetary Fund (IMF), and other international organizations. All data
                is publicly available and regularly updated.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Coverage Period
              </h3>
              <p className="text-sm text-muted-foreground">
                Historical data spanning from 2000 to 2024, covering over 190 countries and territories.
                Data includes both economic and food security indicators with annual granularity.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Data Quality
              </h3>
              <p className="text-sm text-muted-foreground">
                All datasets undergo quality checks and validation. Missing values are handled
                appropriately, and data anomalies are flagged. For detailed methodology, please
                refer to the source organizations' documentation.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Export Formats
              </h3>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium text-sm">CSV Format</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Comma-separated values, compatible with Excel, Google Sheets, and data analysis tools
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium text-sm">Excel Format</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Microsoft Excel workbook (.xlsx) with formatted sheets and headers
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Modal */}
      <ExportDataModal
        open={showExportModal}
        onOpenChange={setShowExportModal}
        data={[...economicData, ...foodData]}
      />
    </div>
  );
};

export default Reports;
