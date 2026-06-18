import { useMemo, useState } from "react";
import { Plus, SlidersHorizontal, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { normalizeSearch } from "@/helpers/search";
import { useRepresentatives } from "@/hooks/useUsers";
import { TableComponent } from "@/components/table/TableComponent";
import { PaginationComponent } from "@/components/table/PaginationComponent";
import { representativeColumns } from "@/services/users/representative.tables";
import SearchFilterComponent from "@/components/filters/SearchFilter";
import type { IRepresentative } from "@/services/users/user.interface";

type FilterView = "active" | "all" | "multiple";

interface RepresentativesViewProps {
  onCreate?: () => void;
  onEdit?: (rep: IRepresentative) => void;
}

const VIEW_OPTIONS: { value: FilterView; label: string }[] = [
  { value: "active", label: "Activos" },
  { value: "all", label: "Todos" },
  { value: "multiple", label: "Más de 1 alumno" },
];

export default function RepresentativesView({ onCreate, onEdit }: RepresentativesViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterView, setFilterView] = useState<FilterView>("active");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [filterOpen, setFilterOpen] = useState(false);

  const viewParam = filterView === "active" ? "active" : undefined;
  const minStudents = filterView === "multiple" ? 2 : undefined;

  const { data: representatives = [], isLoading } = useRepresentatives({
    view: viewParam,
    minStudents,
  });

  const filteredRepresentatives = useMemo(() => {
    const term = normalizeSearch(searchTerm);
    if (!term) return representatives as IRepresentative[];
    return (representatives as IRepresentative[]).filter((rep) => {
      const fn = normalizeSearch(rep.person.firstNames ?? "");
      const ln = normalizeSearch(rep.person.lastNames ?? "");
      const id = normalizeSearch(rep.person.identificationNumber ?? "");
      return fn.includes(term) || ln.includes(term) || id.includes(term);
    });
  }, [representatives, searchTerm]);

  const totalPages = Math.ceil(filteredRepresentatives.length / itemsPerPage);
  const paginatedData = filteredRepresentatives.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const pillClass = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer select-none ${active
      ? "bg-(--blueColor) text-white shadow-sm"
      : "border border-(--lightBlueColor)/40 text-(--darkBlueColor) hover:bg-(--grayColor)"
    }`;

  return (
    <div className="">

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-4">
        <SearchFilterComponent
          searchTerm={searchTerm}
          setSearchTerm={(term) => { setSearchTerm(term); setCurrentPage(1); }}
          placeHolder="Buscar por nombre, apellido o cédula..."
          width="w-92"
        />
        <div className="flex gap-2 items-center">
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <button
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-(--lightBlueColor)/40 text-(--darkBlueColor) hover:bg-(--grayColor) transition-all shadow-sm cursor-pointer"
              >
                <SlidersHorizontal size={17} />
                <span className="text-sm font-medium">Filtros</span>
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" sideOffset={8} className="w-56 p-3 space-y-2">
              <p className="text-xs font-semibold text-(--darkBlueColor)/60 uppercase tracking-wider">Vista</p>
              <div className="flex flex-wrap gap-1.5">
                {VIEW_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setFilterView(opt.value); setCurrentPage(1); setFilterOpen(false); }}
                    className={pillClass(filterView === opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="border-t border-(--lightBlueColor)/20 pt-2">
                <button
                  onClick={() => { setFilterView("active"); setCurrentPage(1); setFilterOpen(false); }}
                  className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 font-medium transition cursor-pointer"
                >
                  <X size="16" />
                  Limpiar filtros
                </button>
              </div>
            </PopoverContent>
          </Popover>
          {onCreate && (
            <button
              type="button"
              onClick={onCreate}
              className="flex items-center gap-2 bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg font-medium cursor-pointer"
            >
              <Plus size={18} />
              Crear representante
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400">
          Cargando representantes...
        </div>
      ) : filteredRepresentatives.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400">
          {searchTerm ? "No se encontraron representantes" : "No hay representantes registrados"}
        </div>
      ) : (
        <>
          <TableComponent
            data={paginatedData as IRepresentative[]}
            columns={representativeColumns(onEdit)}
            maxHeight={438}
          />
          <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredRepresentatives.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </>
      )}
    </div>
  );
}
