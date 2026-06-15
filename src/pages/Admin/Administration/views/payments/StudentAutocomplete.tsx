import { useState, useCallback, useRef, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useStudentsWithDebts } from "@/hooks/useStudentsWithDebts";
import { Search } from "lucide-react";
import type { PaymentFormValues } from "./payments.schema";
import type { IStudent } from "@/services/users/user.interface";

interface StudentWithDebts extends IStudent {
  paidFeeIds: number[];
}

interface StudentAutocompleteProps {
  onSelect?: (student: IStudent, paidFeeIds: number[]) => void;
}

export default function StudentAutocomplete({ onSelect }: StudentAutocompleteProps) {
  const { data: rawData = [] } = useStudentsWithDebts();
  const { setValue, formState, watch } = useFormContext<PaymentFormValues>();
  const studentId = watch("studentId");

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Clear internal display state when form resets
  useEffect(() => {
    if (!studentId) {
      setQuery("");
      setSelectedLabel("");
      setIsOpen(false);
    }
  }, [studentId]);

  const filtered = (rawData as StudentWithDebts[])
    .filter((s) => {
      const name = `${s.person.firstNames} ${s.person.lastNames}`.toLowerCase();
      const id = (s.person.identificationNumber ?? "").toLowerCase();
      const term = query.toLowerCase();
      return name.includes(term) || id.includes(term);
    })
    .slice(0, 10);

  const handleSelect = useCallback(
    (student: StudentWithDebts) => {
      const label = `${student.person.firstNames} ${student.person.lastNames} - ${student.person.identificationNumber}`;
      setSelectedLabel(label);
      setQuery(label);
      setValue("studentId", student.id, { shouldValidate: true });
      onSelect?.(student, student.paidFeeIds);
      setIsOpen(false);
    },
    [setValue, onSelect],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setSelectedLabel("");
    if (val === "") {
      setValue("studentId", undefined as any);
    }
    setIsOpen(true);
  };

  const handleBlur = useCallback(() => {
    setTimeout(() => setIsOpen(false), 200);
  }, []);

  const errorMessage = formState.errors.studentId?.message as string | undefined;

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
    <div ref={wrapperRef} className="relative">
      <label className="block text-sm font-medium text-(--darkBlueColor) mb-1">
        Buscar Estudiante <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={selectedLabel || query}
          onChange={handleInputChange}
          onFocus={() => {
            if (query) setIsOpen(true);
          }}
          onBlur={handleBlur}
          placeholder="Escriba para buscar estudiante..."
          className="w-full pl-10 pr-4 h-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--blueColor) focus:border-transparent"
        />
      </div>
      {errorMessage && (
        <p className="text-red-500 text-xs mt-1">{errorMessage}</p>
      )}

      {isOpen && filtered.length > 0 && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filtered.map((s: StudentWithDebts) => (
            <button
              key={s.id}
              type="button"
              onMouseDown={() => handleSelect(s)}
              className="w-full text-left px-4 py-2.5 hover:bg-(--lightBlueColor)/10 transition flex items-center gap-3 border-b border-gray-50 last:border-0"
            >
              <div className="w-8 h-8 bg-linear-to-br from-blue-900 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0">
                {s.person.firstNames.charAt(0)}
                {s.person.lastNames.charAt(0)}
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
