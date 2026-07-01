import { useState, useCallback, useRef, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useRepresentatives } from "@/hooks/useUsers";
import { Search } from "lucide-react";
import type { IRepresentative } from "@/services/users/user.interface";

interface RepresentativeAutocompleteProps {
  onSelect?: (rep: IRepresentative) => void;
}

export default function RepresentativeAutocomplete({ onSelect }: RepresentativeAutocompleteProps) {
  const { data: rawData } = useRepresentatives({ take: 200 });
  const reps = Array.isArray(rawData) ? rawData : (rawData as { data?: IRepresentative[] } | undefined)?.data ?? [];

  const { setValue, watch } = useFormContext();
  const payerName = watch("payerName");

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (payerName) {
      setSelectedLabel(payerName);
    } else {
      setQuery("");
      setSelectedLabel("");
      setIsOpen(false);
    }
  }, [payerName]);

  const filtered = (reps as IRepresentative[])
    .filter((r) => {
      const name = `${r.person.firstNames} ${r.person.lastNames}`.toLowerCase();
      const id = (r.person.identificationNumber ?? "").toLowerCase();
      const term = query.toLowerCase();
      return name.includes(term) || id.includes(term);
    })
    .slice(0, 10);

  const handleSelect = useCallback(
    (rep: IRepresentative) => {
      const label = `${rep.person.firstNames} ${rep.person.lastNames} - ${rep.person.identificationNumber}`;
      setSelectedLabel(label);
      setQuery(label);
      setValue("payerName", `${rep.person.firstNames} ${rep.person.lastNames}`);
      setValue("payerIdentification", rep.person.identificationNumber);
      setValue("payerPhone", rep.phone ?? "");
      onSelect?.(rep);
      setIsOpen(false);
    },
    [setValue, onSelect],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setSelectedLabel("");
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
    <div ref={wrapperRef} className="relative">
      <label className="block text-sm font-medium text-(--darkBlueColor) mb-1">
        Buscar Representante
      </label>
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={selectedLabel || query}
          onChange={handleInputChange}
          onFocus={() => { if (query) setIsOpen(true); }}
          placeholder="Escriba para buscar representante..."
          className="w-full pl-10 pr-4 h-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--blueColor) focus:border-transparent"
        />
      </div>

      {isOpen && filtered.length > 0 && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filtered.map((r) => (
            <button
              key={r.id}
              type="button"
              onMouseDown={() => handleSelect(r)}
              className="w-full text-left px-4 py-2.5 hover:bg-(--lightBlueColor)/10 transition flex items-center gap-3 border-b border-gray-50 last:border-0"
            >
              <div className="w-8 h-8 bg-linear-to-br from-blue-900 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0">
                {r.person.firstNames.charAt(0)}{r.person.lastNames.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {r.person.firstNames} {r.person.lastNames}
                </p>
                <p className="text-xs text-gray-400">
                  {r.person.identificationNumber}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}