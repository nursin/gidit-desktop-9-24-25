import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sheet, Plus } from "lucide-react";

type SpreadsheetProps = {
  name?: string;
};

type CellMap = Record<string, string>;

export default function Spreadsheet({ name = "Spreadsheet" }: SpreadsheetProps) {
  const [rows, setRows] = useState(50);
  const [cols, setCols] = useState(26);
  const [data, setData] = useState<CellMap>({});

  const columnHeaders = useMemo(() => Array.from({ length: cols }, (_, index) => index), [cols]);
  const rowHeaders = useMemo(() => Array.from({ length: rows }, (_, index) => index), [rows]);

  const getColumnName = (index: number) => {
    let name = "";
    let remainder = index;
    while (remainder >= 0) {
      name = String.fromCharCode((remainder % 26) + 65) + name;
      remainder = Math.floor(remainder / 26) - 1;
    }
    return name;
  };

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const key = `${rowIndex}-${colIndex}`;
    setData((previous) => ({ ...previous, [key]: value }));
  };

  return (
    <Card className="flex h-full flex-col border-0 bg-transparent shadow-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sheet className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>{name}</CardTitle>
              <CardDescription>Organize your data in a grid.</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setRows((count) => count + 1)}>
              <Plus className="mr-2 h-4 w-4" /> Row
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCols((count) => count + 1)}>
              <Plus className="mr-2 h-4 w-4" /> Column
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto rounded-lg border p-0">
        <div className="relative">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-secondary">
                <th className="sticky left-0 top-0 z-20 w-12 border bg-secondary p-1" />
                {columnHeaders.map((columnIndex) => (
                  <th
                    key={columnIndex}
                    className="sticky top-0 border bg-secondary p-1 font-semibold"
                  >
                    {getColumnName(columnIndex)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rowHeaders.map((rowIndex) => (
                <tr key={rowIndex}>
                  <td className="sticky left-0 border bg-secondary p-1 text-center font-semibold">
                    {rowIndex + 1}
                  </td>
                  {columnHeaders.map((colIndex) => (
                    <td key={`${rowIndex}-${colIndex}`} className="border p-0">
                      <input
                        value={data[`${rowIndex}-${colIndex}`] ?? ""}
                        onChange={(event) =>
                          handleCellChange(rowIndex, colIndex, event.target.value)
                        }
                        className="h-full w-full bg-transparent p-1 focus:bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
