import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationComponentProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
}

export function PaginationComponent({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange, }: PaginationComponentProps) {

    if (totalPages <= 1) return null;

    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center">

            <p className="text-sm text-gray-500">
                Mostrando {start} - {end} de {totalItems}
            </p>

            <div className="flex gap-2">

                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    <ChevronLeft size={18} />
                </button>

                <span className="px-4 py-2 bg-blue-900 text-white rounded-lg">
                    {currentPage}
                </span>

                <button
                    onClick={() =>
                        onPageChange(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    <ChevronRight size={18} />
                </button>

            </div>
        </div>
    );
}