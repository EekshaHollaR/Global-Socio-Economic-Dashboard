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
  const [countries, setCountries] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('Haiti');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedCrisisType, setSelectedCrisisType] = useState<'economic' | 'food'>('economic');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [economic, food, countryList] = await Promise.all([
        DataLoader.loadEconomicData(),
        DataLoader.loadFoodData(),
        DataLoader.getCountries()
      ]);
      setEconomicData(economic);
      setFoodData(food);
      setCountries(countryList);
      if (countryList.length > 0 && !countryList.includes(selectedCountry)) {
        setSelectedCountry(countryList[0]);
      }
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

  const handleQuickExport = async (type: 'economic' | 'food', format: 'excel' | 'csv') => {
    try {
      setLoading(true);
      const data = type === 'economic' ? economicData : foodData;
      const filename = `${type}_data_${new Date().toISOString().split('T')[0]}`;

      if (format === 'excel') {
        exportToXLSX(data, filename);
      } else {
        exportToCSV(data, filename);
      }

      toast({
        title: 'Export Successful',
        description: `${type === 'economic' ? 'Economic' : 'Food'} data exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'An error occurred during export',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkExport = async (format: 'excel' | 'csv') => {
    try {
      setLoading(true);
      const combinedData = await DataLoader.getCombinedData();
      const filename = `complete_dataset_all_countries_${new Date().toISOString().split('T')[0]}`;

      if (format === 'excel') {
        exportToXLSX(combinedData, filename);
      } else {
        exportToCSV(combinedData, filename);
      }

      toast({
        title: 'Bulk Export Successful',
        description: `Complete dataset for ${combinedData.length} records exported successfully!`,
      });
    } catch (error) {
      console.error('Bulk export error:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export complete dataset',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Indicators: Yield, Imports, Production, etc.</p>
                <p>• Coverage: 190+ Countries (2000-2024)</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleQuickExport('food', 'excel')}
                  disabled={loading}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Excel
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleQuickExport('food', 'csv')}
                  disabled={loading}
                >
                  <Download className="mr-2 h-4 w-4" />
                  CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Report Section */}
        <section className="mt-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <FileBarChart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Download Detailed Crisis Report</h2>
              <p className="text-muted-foreground">
                Generate a comprehensive 10-12 page PDF report with in-depth analysis and visualizations
              </p>
            </div>
          </div>

          <Card className="bg-muted/30">
            <CardContent className="p-8">
              <div className="grid gap-8 md:grid-cols-3">
                <div className="space-y-4">
                  <Label>Select Country</Label>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {countries.map(country => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label>Analysis Year</Label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2022">2022</SelectItem>
                      <SelectItem value="2021">2021</SelectItem>
                      <SelectItem value="2020">2020</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label>Crisis Type</Label>
                  <RadioGroup value={selectedCrisisType} onValueChange={(val) => setSelectedCrisisType(val as 'economic' | 'food')} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="economic" id="r-econ" />
                      <Label htmlFor="r-econ">Economic</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="food" id="r-food" />
                      <Label htmlFor="r-food">Food Security</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <Button
                  size="lg"
                  className="w-full md:w-auto min-w-[200px]"
                  disabled={loading || !selectedCountry}
                  onClick={async () => {
                    try {
                      const { generateDetailedReport } = await import('@/lib/detailedPdfGenerator');
                      await generateDetailedReport(selectedCountry, selectedYear, selectedCrisisType);
                      toast({
                        title: "Report Generated",
                        description: `Detailed PDF report for ${selectedCountry} has been downloaded.`,
                      });
                    } catch (error) {
                      console.error('PDF Error:', error);
                      toast({
                        title: "Generation Failed",
                        description: error instanceof Error ? error.message : "Could not generate PDF report.",
                        variant: "destructive"
                      });
                    }
                  }}
                >
                  <FileText className="mr-2 h-5 w-5" />
                  Generate Detailed Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Bulk Download Section */}
        <section className="mt-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <Download className="h-6 w-6 text-success" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Download Complete Dataset</h2>
              <p className="text-muted-foreground">
                Export the entire database covering all 190+ countries (2000-2024)
              </p>
            </div>
          </div>

          <Card>
            <CardContent className="p-8">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold mb-2">Dataset Includes:</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• All 12 economic & food security indicators</li>
                    <li>• 190+ countries</li>
                    <li>• 25 years of historical data (2000-2024)</li>
                    <li>• ~{economicData.length.toLocaleString()} total records</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <Button
                    onClick={() => handleBulkExport('excel')}
                    disabled={loading}
                    className="w-full"
                    size="lg"
                  >
                    <FileSpreadsheet className="mr-2 h-5 w-5" />
                    Download Complete Dataset (Excel)
                  </Button>
                  <Button
                    onClick={() => handleBulkExport('csv')}
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    <FileText className="mr-2 h-5 w-5" />
                    Download Complete Dataset (CSV)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

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
    </div >
  );
};

export default Reports;
