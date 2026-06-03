import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useStudentsStore } from "@/stores/students.store";
import { useSchoolYears, useLevels, useSections } from "@/hooks/useSchoolYears";

const VIEW_OPTIONS = [
  { value: "active", label: "Activos" },
  { value: "all", label: "Todos" },
  { value: "pending", label: "Pendientes" },
  { value: "inactive", label: "Inactivos" },
] as const;

const GENDER_OPTIONS = [
  { value: "Masculino", label: "M" },
  { value: "Femenino", label: "F" },
] as const;

export default function FilterDropdown() {
  const [open, setOpen] = useState(false);

  const {
    filterView,
    filterLevelId,
    filterSection,
    filterGender,
    filterAgeMode,
    filterAgeMin,
    filterAgeMax,
    filterAgeExact,
    setFilterView,
    setFilterLevelId,
    setFilterSection,
    setFilterGender,
    setFilterAgeMode,
    setFilterAgeMin,
    setFilterAgeMax,
    setFilterAgeExact,
    clearFilters,
  } = useStudentsStore();

  const { data: schoolYears = [] } = useSchoolYears();
  const { data: levels = [] } = useLevels();
  const { data: allSections = [] } = useSections();

  const activeSchoolYear = useMemo(
    () => (schoolYears as any[]).find((sy: any) => sy.isActive),
    [schoolYears],
  );

  const sections = useMemo(() => {
    if (!activeSchoolYear) return [];
    const seen = new Set<string>();
    return (allSections as any[])
      .filter((s: any) => {
        if (s.schoolYearId !== activeSchoolYear.id) return false;
        const label = s.section ?? s.sectionName ?? s.name ?? String(s.id);
        if (seen.has(label)) return false;
        seen.add(label);
        return true;
      })
      .map((s: any) => s.section ?? s.sectionName ?? s.name ?? String(s.id));
  }, [allSections, activeSchoolYear]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterLevelId !== null) count++;
    if (filterSection !== null) count++;
    if (filterGender !== null) count++;
    if (filterAgeMode === "range") {
      if (filterAgeMin !== null || filterAgeMax !== null) count++;
    } else {
      if (filterAgeExact !== null) count++;
    }
    return count;
  }, [filterLevelId, filterSection, filterGender, filterAgeMode, filterAgeMin, filterAgeMax, filterAgeExact]);

  const pillClass = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer select-none ${
      active
        ? "bg-(--blueColor) text-white shadow-sm"
        : "border border-(--lightBlueColor)/40 text-(--darkBlueColor) hover:bg-(--grayColor)"
    }`;

  const sectionLabel = (label: string) => (
    <p className="text-xs font-semibold text-(--darkBlueColor)/60 uppercase tracking-wider">{label}</p>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-(--lightBlueColor)/40 text-(--darkBlueColor) hover:bg-(--grayColor) transition-all shadow-sm cursor-pointer"
        >
          <SlidersHorizontal size={17} />
          <span className="text-sm font-medium">Filtros</span>
          {activeFilterCount > 0 && (
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-(--blueColor) text-white text-xs font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={8} className="w-100 p-3 space-y-3">
        {/* Vista */}
        <div className="space-y-1.5">
          {sectionLabel("Vista")}
          <div className="flex flex-wrap gap-1.5">
            {VIEW_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilterView(opt.value as typeof filterView)}
                className={pillClass(filterView === opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-(--lightBlueColor)/20" />

        {/* Nivel + Sección en grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            {sectionLabel("Nivel")}
            <div className="flex flex-wrap gap-1.5">
              {(levels as any[]).map((lvl: any) => (
                <button
                  key={lvl.id}
                  onClick={() => setFilterLevelId(filterLevelId === lvl.id ? null : lvl.id)}
                  className={pillClass(filterLevelId === lvl.id)}
                >
                  {lvl.level}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            {sectionLabel("Sección")}
            <div className="flex flex-wrap gap-1.5">
              {sections.map((sec) => (
                <button
                  key={sec}
                  onClick={() => setFilterSection(filterSection === sec ? null : sec)}
                  className={pillClass(filterSection === sec)}
                >
                  {sec}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-(--lightBlueColor)/20" />

        {/* Género */}
        <div className="space-y-1.5">
          {sectionLabel("Género")}
          <div className="flex flex-wrap gap-1.5">
            {GENDER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilterGender(filterGender === opt.value ? null : opt.value)}
                className={pillClass(filterGender === opt.value)}
              >
                {opt.label}
              </button>
            ))}
            <button
              onClick={() => setFilterGender(null)}
              className={pillClass(filterGender === null)}
            >
              Todos
            </button>
          </div>
        </div>

        {/* Edad */}
        <div className="space-y-1.5">
          {sectionLabel("Edad")}
          <div className="flex gap-1.5 mb-1">
            <button
              onClick={() => setFilterAgeMode("range")}
              className={pillClass(filterAgeMode === "range")}
            >
              Rango
            </button>
            <button
              onClick={() => setFilterAgeMode("exact")}
              className={pillClass(filterAgeMode === "exact")}
            >
              Exacta
            </button>
          </div>
          {filterAgeMode === "range" ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={99}
                placeholder="Min"
                value={filterAgeMin ?? ""}
                onChange={(e) => setFilterAgeMin(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-1.5 rounded-lg border border-(--lightBlueColor)/40 text-sm text-(--darkBlueColor) placeholder:text-(--lightBlueColor) focus:outline-none focus:ring-2 focus:ring-(--blueColor)/30"
              />
              <span className="text-(--lightBlueColor) text-sm">a</span>
              <input
                type="number"
                min={0}
                max={99}
                placeholder="Max"
                value={filterAgeMax ?? ""}
                onChange={(e) => setFilterAgeMax(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-1.5 rounded-lg border border-(--lightBlueColor)/40 text-sm text-(--darkBlueColor) placeholder:text-(--lightBlueColor) focus:outline-none focus:ring-2 focus:ring-(--blueColor)/30"
              />
            </div>
          ) : (
            <input
              type="number"
              min={0}
              max={99}
              placeholder="Edad exacta"
              value={filterAgeExact ?? ""}
              onChange={(e) => setFilterAgeExact(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-1.5 rounded-lg border border-(--lightBlueColor)/40 text-sm text-(--darkBlueColor) placeholder:text-(--lightBlueColor) focus:outline-none focus:ring-2 focus:ring-(--blueColor)/30"
            />
          )}
        </div>

        {/* Limpiar */}
        <div className="border-t border-(--lightBlueColor)/20 pt-2">
          <button
            onClick={() => { clearFilters(); setOpen(false); }}
            className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 font-medium transition cursor-pointer"
          >
            <X size="16" />
            Limpiar filtros
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
