import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { generateCrisisReport } from '@/lib/pdfGenerator';
import { CrisisResult } from '@/lib/crisisAnalysis';
import { useToast } from '@/hooks/use-toast';

interface PDFReportButtonProps {
    results: CrisisResult[];
    crisisType: 'economic' | 'food';
    disabled?: boolean;
}

const PDFReportButton = ({ results, crisisType, disabled = false }: PDFReportButtonProps) => {
    const [generating, setGenerating] = useState(false);
    const [selectedYear, setSelectedYear] = useState('2025');
    const { toast } = useToast();

    // Generate year options from 2000 to 2025
    const yearOptions = [];
    for (let year = 2000; year <= 2025; year++) {
        yearOptions.push(year.toString());
    }

    const handleGeneratePDF = async () => {
        if (!results || results.length === 0) {
            toast({
                title: 'No Data',
                description: 'No crisis analysis results available to generate report',
                variant: 'destructive',
            });
            return;
        }

        setGenerating(true);
        try {
            await generateCrisisReport(results, crisisType, selectedYear);

            toast({
                title: 'PDF Generated',
                description: `Crisis analysis report for ${selectedYear} has been downloaded successfully`,
            });
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast({
                title: 'Generation Failed',
                description: 'Failed to generate PDF report. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setGenerating(false);
        }
    };

    const yearLabel = selectedYear === '2025' ? `${selectedYear} (Predicted)` : selectedYear;

    return (
        <div className="flex items-center gap-2">
            <Select value={selectedYear} onValueChange={setSelectedYear} disabled={generating || disabled}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                    {yearOptions.map((year) => (
                        <SelectItem key={year} value={year}>
                            {year === '2025' ? `${year} (Predicted)` : year}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Button
                variant="default"
                size="sm"
                onClick={handleGeneratePDF}
                disabled={disabled || generating || !results || results.length === 0}
                className="gap-2"
            >
                {generating ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating PDF...
                    </>
                ) : (
                    <>
                        <FileDown className="h-4 w-4" />
                        Download PDF Report
                    </>
                )}
            </Button>
        </div>
    );
};

export default PDFReportButton;
