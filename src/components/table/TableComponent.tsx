import { Fragment, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

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
    renderExpanded?: (row: T) => React.ReactNode;
    getRowId?: (row: T) => string | number;
}

export function TableComponent<T>({
    data, columns, onRowClick, rowClassName, renderExpanded, getRowId,
}: TableComponentProps<T>) {
    const [expandedRows, setExpandedRows] = useState<Set<string | number>>(new Set());

    const toggleRow = (rowId: string | number) => {
        setExpandedRows((prev) => {
            const next = new Set(prev);
            if (next.has(rowId)) {
                next.delete(rowId);
            } else {
                next.add(rowId);
            }
            return next;
        });
    };

    const fullColCount = columns.length + (renderExpanded ? 1 : 0);

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
                            {renderExpanded && (
                                <TableHead className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase w-12">
                                    ABRIR
                                </TableHead>
                            )}
                        </TableRow>
                    </TableHeader>

                    {/* BODY */}
                    <TableBody className="divide-y divide-gray-100">
                        {data.map((row, rowIndex) => {
                            const rowId = getRowId ? getRowId(row) : rowIndex;
                            const isExpanded = expandedRows.has(rowId);

                            return (
                                <Fragment key={rowIndex}>
                                    <TableRow
                                        onClick={() => {
                                            if (renderExpanded) toggleRow(rowId);
                                            onRowClick?.(row);
                                        }}
                                        className={`hover:bg-gray-100 transition ${renderExpanded || onRowClick ? "cursor-pointer" : ""} ${rowClassName ? rowClassName(row) : ""}`}
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
                                        {renderExpanded && (
                                            <TableCell className="px-4 py-4 w-12 text-center">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleRow(rowId);
                                                    }}
                                                    className="p-1 hover:bg-gray-100 rounded-md transition cursor-pointer"
                                                >
                                                    <ChevronDown
                                                        size={16}
                                                        className={`text-gray-400 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                                                    />
                                                </button>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                    {renderExpanded && (
                                        <TableRow>
                                            <TableCell colSpan={fullColCount} className="p-0 border-0">
                                                <div
                                                    className="grid transition-[grid-template-rows] duration-300 ease-in-out"
                                                    style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
                                                >
                                                    <div className="overflow-hidden min-h-0">
                                                        <div className="border-t border-gray-100">
                                                            {renderExpanded(row)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </Fragment>
                            );
                        })}
                    </TableBody>

                </Table>
            </div>
        </div>
    );
}