import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationComponentProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (itemsPerPage: number) => void;
}

const ITEMS_PER_PAGE_OPTIONS = [4, 5, 6, 12, 24, 48];

function getPageNumbers(current: number, total: number): (number | string)[] {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

    if (current <= 3) return [1, 2, 3, 4, "ellipsis-end", total];
    if (current >= total - 2) return [1, "ellipsis-start", total - 3, total - 2, total - 1, total];
    return [1, "ellipsis-start", current - 1, current, current + 1, "ellipsis-end", total];
}

export function PaginationComponent({
    currentPage, totalPages, totalItems,
    itemsPerPage, onPageChange, onItemsPerPageChange,
}: PaginationComponentProps) {
    if (totalPages <= 1) return null;

    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalItems);
    const pages = getPageNumbers(currentPage, totalPages);

    return (
        <div className="px-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
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

            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    <ChevronLeft size={18} />
                </button>

                {pages.map((page, i) =>
                    typeof page === "string" ? (
                        <span key={page} className="px-2 text-gray-400 select-none">...</span>
                    ) : (
                        <button
                            key={i}
                            onClick={() => onPageChange(page)}
                            className={`min-w-[36px] px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                                page === currentPage
                                    ? "bg-blue-900 text-white shadow-sm"
                                    : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                            {page}
                        </button>
                    )
                )}

                <button
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
}
