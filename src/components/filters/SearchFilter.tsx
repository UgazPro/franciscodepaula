import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchFilterComponentProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    placeHolder?: string;
    width?: string;
}

export default function SearchFilterComponent({ searchTerm, setSearchTerm, placeHolder, width }: SearchFilterComponentProps) {

    return (
        <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
                placeholder={placeHolder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-12 h-12 text-base border-2 border-gray-300 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl bg-white shadow-sm ${width || 'w-full'}`}
            />
        </div>
    );
}
