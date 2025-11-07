import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Column {
  key: string;
  label: string;
  format?: (value: any) => string;
}

interface DataTableProps {
  title?: string;
  columns: Column[];
  data: any[];
  maxRows?: number;
}

const DataTable = ({ title, columns, data, maxRows = 10 }: DataTableProps) => {
  const displayData = maxRows ? data.slice(0, maxRows) : data;

  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                {columns.map((column) => (
                  <TableHead key={column.key} className="font-semibold">
                    {column.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-center text-muted-foreground"
                  >
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                displayData.map((row, index) => (
                  <TableRow key={index} className="hover:bg-muted/30">
                    {columns.map((column) => (
                      <TableCell key={column.key}>
                        {column.format
                          ? column.format(row[column.key])
                          : row[column.key] || "—"}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {data.length > maxRows && (
          <p className="text-sm text-muted-foreground mt-2">
            Showing {maxRows} of {data.length} records
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default DataTable;
