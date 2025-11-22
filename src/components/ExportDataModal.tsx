import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportToCSV, exportToXLSX } from '@/utils/exportData';

interface ExportDataModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    country?: string;
    data: any[];
}

const ExportDataModal = ({ open, onOpenChange, country, data }: ExportDataModalProps) => {
    const [yearSelection, setYearSelection] = useState<'specific' | 'all'>('specific');
    const [selectedYear, setSelectedYear] = useState('2024');
    const [dataType, setDataType] = useState<'economic' | 'food'>('economic');
    const [exportFormat, setExportFormat] = useState<'csv' | 'excel'>('csv');
    const [exporting, setExporting] = useState(false);
    const { toast } = useToast();

    // Generate year options from 2000 to 2024 (historical data)
    const yearOptions = [];
    for (let year = 2000; year <= 2024; year++) {
        yearOptions.push(year.toString());
    }

    const handleExport = async () => {
        setExporting(true);
        try {
            // Filter data based on selections
            let filteredData = [...data];

            // Filter by year if specific year selected
            if (yearSelection === 'specific' && selectedYear) {
                filteredData = filteredData.filter((row: any) =>
                    row.year?.toString() === selectedYear || row.Date?.toString() === selectedYear
                );
            }

            // Generate filename
            const yearPart = yearSelection === 'all' ? 'fulldata' : selectedYear;
            const countryPart = country ? `${country.replace(/\s+/g, '_')}_` : '';
            const filename = `${countryPart}${yearPart}_${dataType}`;

            // Export based on format
            if (exportFormat === 'csv') {
                exportToCSV(filteredData, filename);
            } else {
                exportToXLSX(filteredData, filename);
            }

            toast({
                title: 'Export Successful',
                description: `Data exported as ${filename}.${exportFormat}`,
            });

            onOpenChange(false);
        } catch (error) {
            console.error('Export error:', error);
            toast({
                title: 'Export Failed',
                description: 'Failed to export data. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setExporting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Export Data</DialogTitle>
                    <DialogDescription>
                        Configure your data export options
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Year Selection */}
                    <div className="space-y-3">
                        <Label>Select Year</Label>
                        <RadioGroup value={yearSelection} onValueChange={(v) => setYearSelection(v as 'specific' | 'all')}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="specific" id="specific" />
                                <Label htmlFor="specific" className="font-normal cursor-pointer">
                                    Download data for a specific year
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="all" id="all" />
                                <Label htmlFor="all" className="font-normal cursor-pointer">
                                    Download full dataset (all years)
                                </Label>
                            </div>
                        </RadioGroup>

                        {yearSelection === 'specific' && (
                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {yearOptions.map((year) => (
                                        <SelectItem key={year} value={year}>
                                            {year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    {/* Data Type Selection */}
                    <div className="space-y-3">
                        <Label>Select Data Type</Label>
                        <RadioGroup value={dataType} onValueChange={(v) => setDataType(v as 'economic' | 'food')}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="economic" id="economic" />
                                <Label htmlFor="economic" className="font-normal cursor-pointer">
                                    Economic Data
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="food" id="food" />
                                <Label htmlFor="food" className="font-normal cursor-pointer">
                                    Food Data
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Export Format */}
                    <div className="space-y-3">
                        <Label>Export Format</Label>
                        <RadioGroup value={exportFormat} onValueChange={(v) => setExportFormat(v as 'csv' | 'excel')}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="csv" id="csv" />
                                <Label htmlFor="csv" className="font-normal cursor-pointer">
                                    CSV (.csv)
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="excel" id="excel" />
                                <Label htmlFor="excel" className="font-normal cursor-pointer">
                                    Excel (.xlsx)
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={exporting}>
                        Cancel
                    </Button>
                    <Button onClick={handleExport} disabled={exporting || !data || data.length === 0}>
                        {exporting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Exporting...
                            </>
                        ) : (
                            <>
                                <Download className="mr-2 h-4 w-4" />
                                Export Data
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ExportDataModal;
