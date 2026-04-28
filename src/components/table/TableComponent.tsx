import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, } from "@/components/ui/table";

export interface Column<T> {
    header: string;
    accessor?: keyof T;
    render?: (row: T) => React.ReactNode;
    className?: string;
    headerClassName?: string;
}

interface TableComponentProps<T> {
    data: T[];
    columns: Column<T>[];
    onRowClick?: (row: T) => void;
    rowClassName?: (row: T) => string;
}

export function TableComponent<T>({ data, columns, onRowClick, rowClassName, }: TableComponentProps<T>) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <Table className="w-full">

                    {/* HEADER */}
                    <TableHeader className="bg-gray-50 border-b border-gray-200">
                        <TableRow>
                            {columns.map((col, index) => (
                                <TableHead
                                    key={index}
                                    className={`px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase ${col.headerClassName ?? ""}`}
                                >
                                    {col.header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>

                    {/* BODY */}
                    <TableBody className="divide-y divide-gray-100">
                        {data.map((row, rowIndex) => (
                            <TableRow
                                key={rowIndex}
                                onClick={() => onRowClick?.(row)}
                                className={`hover:bg-gray-50 transition ${onRowClick ? "cursor-pointer" : ""
                                    } ${rowClassName ? rowClassName(row) : ""}`}
                            >
                                {columns.map((col, colIndex) => (
                                    <TableCell
                                        key={colIndex}
                                        className={`px-6 py-4 ${col.className ?? ""}`}
                                    >
                                        {col.render
                                            ? col.render(row)
                                            : col.accessor
                                                ? String(row[col.accessor] ?? "")
                                                : null}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>

                </Table>
            </div>
        </div>
    );
}