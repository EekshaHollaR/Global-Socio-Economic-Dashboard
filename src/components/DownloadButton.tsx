import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download } from "lucide-react";
import ExportDataModal from './ExportDataModal';

interface DownloadButtonProps {
  data: any[];
  filename: string;
  disabled?: boolean;
  country?: string;
}

const DownloadButton = ({ data, filename, disabled = false, country }: DownloadButtonProps) => {
  const [showExportModal, setShowExportModal] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        disabled={disabled || !data || data.length === 0}
        onClick={() => setShowExportModal(true)}
      >
        <Download className="mr-2 h-4 w-4" />
        Download Data
      </Button>

      <ExportDataModal
        open={showExportModal}
        onOpenChange={setShowExportModal}
        data={data}
        country={country}
      />
    </>
  );
};

export default DownloadButton;
