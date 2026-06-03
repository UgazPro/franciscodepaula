import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface AutocompleteFieldProps {
  name: string;
  label: string;
  options: { label: string; value: string }[];
  placeholder?: string;
  disabled?: boolean;
}

export default function AutocompleteField({
  name,
  label,
  options,
  placeholder = "Escriba para buscar...",
  disabled,
}: AutocompleteFieldProps) {
  const { setValue, getValues, formState } = useFormContext();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const errorMessage = formState.errors[name]?.message as string | undefined;

  useEffect(() => {
    const current = getValues(name);
    if (current) {
      const match = options.find((o) => o.value === current);
      setQuery(match ? match.label : current);
    }
  }, []);

  const filtered = useMemo(
    () =>
      options
        .filter((opt) => opt.label.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 15),
    [options, query],
  );

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [filtered.length]);

  const handleSelect = useCallback(
    (opt: { label: string; value: string }) => {
      setQuery(opt.label);
      setValue(name, opt.value, { shouldValidate: true });
      setIsOpen(false);
    },
    [name, setValue],
  );

  const handleBlur = useCallback(() => {
    setTimeout(() => setIsOpen(false), 200);
    setValue(name, query, { shouldValidate: true });
  }, [name, query, setValue]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen || disabled) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filtered.length - 1 ? prev + 1 : prev,
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === "Enter" && highlightedIndex >= 0) {
        e.preventDefault();
        handleSelect(filtered[highlightedIndex]);
      }
    },
    [isOpen, disabled, filtered, highlightedIndex, handleSelect],
  );

  useEffect(() => {
    if (highlightedIndex >= 0 && itemRefs.current[highlightedIndex]) {
      itemRefs.current[highlightedIndex]?.scrollIntoView({
        block: "nearest",
      });
    }
  }, [highlightedIndex]);

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
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (query) setIsOpen(true);
          }}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "w-full pl-10 pr-4 h-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--blueColor) focus:border-transparent",
            disabled && "bg-gray-100 cursor-not-allowed opacity-70",
            errorMessage ? "border-red-500" : "border-(--lightBlueColor)/30",
          )}
        />
      </div>
      {errorMessage && (
        <p className="text-red-500 text-xs mt-1">{errorMessage}</p>
      )}
      {isOpen && !disabled && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((opt, i) => (
              <button
                key={opt.value}
                ref={(el) => { itemRefs.current[i] = el; }}
                type="button"
                onMouseDown={() => handleSelect(opt)}
                className={cn(
                  "w-full text-left px-4 py-2.5 transition text-sm text-gray-700 border-b border-gray-50 last:border-0",
                  i === highlightedIndex
                    ? "bg-(--lightBlueColor)/20"
                    : "hover:bg-(--lightBlueColor)/10",
                )}
              >
                {opt.label}
              </button>
            ))
          ) : (
            <p className="px-4 py-3 text-sm text-gray-400">Sin resultados</p>
          )}
        </div>
      )}
    </div>
  );
}
