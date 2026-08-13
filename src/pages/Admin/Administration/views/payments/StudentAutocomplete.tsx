import { useState, useCallback, useRef, useEffect } from "react";
import { useStudentsWithDebts } from "@/hooks/useStudentsWithDebts";
import { Search } from "lucide-react";
import type { IStudent } from "@/services/users/user.interface";

export interface StudentDebtInfo {
  feeId: number;
  feeName: string;
  totalValue: number;
  paidAmount: number;
  pending: number;
  schoolYearName?: string;
}

interface StudentWithDebts extends IStudent {
  paidFeeIds?: number[];
  debts?: StudentDebtInfo[];
  enrollments?: {
    schoolYear?: {
      fees?: { id: number }[];
    };
  }[];
}

interface StudentAutocompleteProps {
  onSelect: (student: IStudent, paidFeeIds: number[], debts: StudentDebtInfo[]) => void;
  excludeIds?: number[];
}

export default function StudentAutocomplete({ onSelect, excludeIds = [] }: StudentAutocompleteProps) {
  const { data: rawData = [] } = useStudentsWithDebts();

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = (rawData as StudentWithDebts[])
    .filter((s) => {
      if (excludeIds.includes(s.id)) return false;
      const name = `${s.person.firstNames} ${s.person.lastNames}`.toLowerCase();
      const id = (s.person.identificationNumber ?? "").toLowerCase();
      const term = query.toLowerCase();
      return name.includes(term) || id.includes(term);
    })
    .slice(0, 10);

  const handleSelect = useCallback(
    (student: StudentWithDebts) => {
      const allStudentFeeIds = student.enrollments?.flatMap(
        (e) => e.schoolYear?.fees?.map((f) => f.id) ?? [],
      ) ?? [];
      const debtFeeIds = student.debts?.map((d) => d.feeId) ?? [];
      const paidFeeIds = student.paidFeeIds ?? allStudentFeeIds.filter((id) => !debtFeeIds.includes(id));
      const debts = student.debts ?? [];
      onSelect(student, paidFeeIds, debts);
      setQuery("");
      setIsOpen(false);
    },
    [onSelect],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative z-50">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => { if (query || rawData.length > 0) setIsOpen(true); }}
          placeholder="Buscar estudiante..."
          className="w-full pl-10 pr-4 h-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--blueColor) focus:border-transparent"
        />
      </div>

      {isOpen && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-y-auto max-h-52">
          {filtered.map((s) => (
            <button
              key={s.id}
              type="button"
              onMouseDown={() => handleSelect(s)}
              className="w-full text-left px-4 py-2.5 hover:bg-(--lightBlueColor)/10 transition flex items-center gap-3 border-b border-gray-50 last:border-0"
            >
              <div className="w-8 h-8 bg-linear-to-br from-blue-900 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0">
                {s.person.firstNames.charAt(0)}{s.person.lastNames.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {s.person.firstNames} {s.person.lastNames}
                </p>
                <p className="text-xs text-gray-400">
                  {s.person.identificationNumber}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
