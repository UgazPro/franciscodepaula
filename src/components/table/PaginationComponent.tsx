import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationComponentProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (itemsPerPage: number) => void;
}

const ITEMS_PER_PAGE_OPTIONS = [5, 6, 7, 9, 10, 15, 20, 40, 50];

function getPageNumbers(current: number, total: number): number[] {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

    let start = Math.max(2, current - 2);
    let end = Math.min(total, start + 3);
    if (end - start < 3) start = Math.max(2, end - 3);

    return [1, start, start + 1, start + 2, start + 3];
}

export function PaginationComponent({
    currentPage, totalPages, totalItems,
    itemsPerPage, onPageChange, onItemsPerPageChange,
}: PaginationComponentProps) {
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalItems);
    const pages = getPageNumbers(currentPage, totalPages);

    return (
        <div className="px-6 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <p className="text-sm text-gray-500">
                    Mostrando {start} - {end} de {totalItems}
                </p>
                <select
                    value={itemsPerPage}
                    onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                    className="text-sm border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-600 focus:outline-none focus:border-green-500 cursor-pointer"
                >
                    {ITEMS_PER_PAGE_OPTIONS.map((n) => (
                        <option key={n} value={n}>{n} por página</option>
                    ))}
                </select>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    {pages.map((page) =>
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`min-w-[36px] px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                                page === currentPage
                                    ? "bg-blue-900 text-white shadow-sm"
                                    : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                            {page}
                        </button>
                    )}

                    <button
                        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            )}
        </div>
    );
}
