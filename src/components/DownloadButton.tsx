import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download } from "lucide-react";
import { exportToCSV, exportToXLSX } from "@/utils/exportData";

interface DownloadButtonProps {
  data: any[];
  filename: string;
  disabled?: boolean;
}

const DownloadButton = ({ data, filename, disabled = false }: DownloadButtonProps) => {
  const handleDownloadCSV = () => {
    exportToCSV(data, filename);
  };

  const handleDownloadXLSX = () => {
    exportToXLSX(data, filename);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled || !data || data.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Download Data
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleDownloadCSV} disabled={!data || data.length === 0}>
          Download CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownloadXLSX} disabled={!data || data.length === 0}>
          Download Excel (.xlsx)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DownloadButton;

