import { useState, useRef, useEffect, useCallback } from "react";
import { useStudentsWithDebts } from "@/hooks/useStudentsWithDebts";
import { Search } from "lucide-react";
import type { IStudent } from "@/services/users/user.interface";

interface StudentAutocompleteProps {
  onSelect: (student: IStudent) => void;
  selectedStudent: IStudent | null;
  onClear: () => void;
  disabled?: boolean;
}

export default function StudentAutocomplete({ onSelect, selectedStudent, onClear, disabled }: StudentAutocompleteProps) {
  const { data: rawData = [] } = useStudentsWithDebts();

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = (rawData as IStudent[])
    .filter((s) => {
      if (s.status === false) return false;
      const name = `${s.person.firstNames} ${s.person.lastNames}`.toLowerCase();
      const id = (s.person.identificationNumber ?? "").toLowerCase();
      const term = query.toLowerCase();
      return name.includes(term) || id.includes(term);
    })
    .slice(0, 10);

  const handleSelect = useCallback(
    (student: IStudent) => {
      onSelect(student);
      setQuery("");
      setIsOpen(false);
    },
    [onSelect],
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (selectedStudent) {
    return (
      <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="w-10 h-10 bg-linear-to-br from-blue-900 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
          {selectedStudent.person.firstNames.charAt(0)}{selectedStudent.person.lastNames.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">
            {selectedStudent.person.firstNames} {selectedStudent.person.lastNames}
          </p>
          <p className="text-xs text-gray-400">{selectedStudent.person.identificationNumber}</p>
        </div>
        {!disabled && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-red-500 hover:text-red-700 cursor-pointer shrink-0"
          >
            Cambiar
          </button>
        )}
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="relative z-50">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => { if (rawData.length > 0) setIsOpen(true); }}
          placeholder="Buscar estudiante por nombre o cédula..."
          disabled={disabled}
          className="w-full pl-10 pr-4 h-10 border border-(--lightBlueColor)/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--blueColor) focus:border-transparent disabled:bg-gray-50"
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
                <p className="text-xs text-gray-400">{s.person.identificationNumber}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && query && filtered.length === 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-400 text-sm">
          No se encontraron estudiantes
        </div>
      )}
    </div>
  );
}
