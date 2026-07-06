import { useState, useEffect, useRef, useCallback, memo } from "react";
import { Link, useLocation } from "react-router";
import { ChevronDown, LogOut, Home, Menu, Loader2 } from "lucide-react";
import { useUserData } from "@/helpers/token";
import { useExchangeRate } from "@/hooks/usePayments";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";
import { useSearchStore } from "@/stores/search.store";
import { useAuthStore } from "@/stores/auth.store";
import type { SearchResult } from "@/stores/search.store";
import SearchFilterComponent from "@/components/filters/SearchFilter";

const roleColors: Record<string, string> = {
  Estudiante: "bg-blue-100 text-blue-700",
  Administrador: "bg-purple-100 text-purple-700",
  Profesor: "bg-blue-100 text-blue-700",
  Representante: "bg-amber-100 text-amber-700",
  Coordinador: "bg-teal-100 text-teal-700",
  Secretario: "bg-pink-100 text-pink-700",
};

function getRoleLabel(type: string, role?: string): string {
  if (type === "student") return "Estudiante";
  return role ?? "—";
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const currentDateString = formatDate(new Date());

interface SearchDropdownProps {
  show: boolean;
  isSearching: boolean;
  results: SearchResult[];
  onSelect: (result: SearchResult) => void;
}

const SearchDropdown = memo(function SearchDropdown({ show, isSearching, results, onSelect }: SearchDropdownProps) {
  if (!show) return null;
  return (
    <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
      {isSearching ? (
        <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-400">
          <Loader2 size={16} className="animate-spin" />
          Buscando...
        </div>
      ) : results.length === 0 ? (
        <div className="py-6 text-center text-sm text-gray-400">
          No se encontraron resultados
        </div>
      ) : (
        <div className="max-h-[360px] overflow-y-auto [overflow-anchor:none]">
          {results.map((result) => {
            const roleLabel = getRoleLabel(result.type, result.role);
            const colorClass = roleColors[roleLabel] || "bg-gray-100 text-gray-700";
            return (
              <button
                key={`${result.type}-${result.id}`}
                type="button"
                onMouseDown={() => onSelect(result)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition border-b border-gray-50 last:border-0 text-left"
              >
                <div className="w-9 h-9 bg-linear-to-br from-(--blueColor) to-(--darkBlueColor) rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0">
                  {result.person.firstNames.charAt(0)}
                  {result.person.lastNames.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {result.person.firstNames} {result.person.lastNames}
                  </p>
                  <p className="text-xs text-gray-400">
                    {result.person.identificationNumber}
                  </p>
                </div>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${colorClass}`}>
                  {roleLabel}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
});

export default function AdminHeader() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const location = useLocation();
  const searchRef = useRef<HTMLDivElement>(null);

  const userDB = useUserData();
  const logout = useAuthStore((s) => s.logout);
  const { data: latestExchange } = useExchangeRate();

  const query = useSearchStore((s) => s.query);
  const results = useSearchStore((s) => s.results);
  const isSearching = useSearchStore((s) => s.isSearching);
  const setQuery = useSearchStore((s) => s.setQuery);
  const setResults = useSearchStore((s) => s.setResults);
  const selectPerson = useSearchStore((s) => s.selectPerson);
  const setIsSearching = useSearchStore((s) => s.setIsSearching);

  const { data: rawResults, isLoading } = useGlobalSearch(query);

  const exchangeRate = latestExchange ? Number(latestExchange.rate) : 0;
  const exchangeRateDate = latestExchange ? new Date(latestExchange.date) : new Date();

  const user = {
    name: userDB?.person.firstNames + " " + userDB?.person.lastNames || "Ana Gómez",
    email: userDB?.email,
    role: userDB?.userRoles[0]?.role.role,
  };

  useEffect(() => {
    if (rawResults && Array.isArray(rawResults)) {
      setResults(rawResults as SearchResult[]);
    } else {
      setResults([]);
    }
  }, [rawResults, setResults]);

  useEffect(() => {
    setIsSearching(isLoading);
  }, [isLoading, setIsSearching]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = useCallback(
    (result: SearchResult) => {
      selectPerson(result);
      setDropdownOpen(false);
    },
    [selectPerson],
  );

  const handleInputChange = (value: string) => {
    setQuery(value);
    setDropdownOpen(value.trim().length >= 2);
  };

  const showDropdown = dropdownOpen && query.length >= 2;

  const getPageTitle = () => {
    const path = location.pathname;
    const titles: Record<string, string> = {
      "/admin": "Dashboard",
      "/admin/control-estudio": "Control de Estudio",
      "/admin/profesores": "Gestión de Profesores",
      "/admin/administracion": "Administración",
      "/admin/secretaria": "Secretaría",
      "/admin/coordinacion": "Coordinación",
      "/admin/estudiantes": "Estudiantes",
      "/admin/calendario": "Calendario Escolar",
      "/admin/perfil": "Mi Perfil",
      "/admin/configuracion": "Configuración",
    };
    return titles[path] || "Panel Administrativo";
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200 px-6">
      <div className="px-4 md:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition">
              <Menu size={20} className="text-gray-600" />
            </button>

            <div className="hidden sm:block">
              <h1 className="text-xl md:text-2xl font-bold text-blue-900">
                {getPageTitle()}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {currentDateString}
              </p>
            </div>
          </div>

          {location.pathname === "/admin/administracion" && exchangeRate > 0 && (
            <div className="flex items-start gap-2 px-3 py-1.5 bg-green-50 border relative border-green-200 rounded-lg shrink-0">
              <span className="text-sm text-green-700">BCV</span>
              <span className="text-sm font-semibold text-green-700">{exchangeRate.toFixed(2)} Bs.</span>
              <span className="text-xs absolute -bottom-4.5 -left-26 text-green-700 whitespace-nowrap">Actualizado el {formatDate(exchangeRateDate)}</span>
            </div>
          )}

          {/* Desktop search */}
          <div className="hidden md:flex items-center flex-1 max-w-md" ref={searchRef}>
            <div className="relative w-full">
              <SearchFilterComponent
                searchTerm={query}
                setSearchTerm={handleInputChange}
                placeHolder="Buscar estudiantes, representantes o personal institucional..."
              />
              <SearchDropdown
                show={showDropdown}
                isSearching={isSearching}
                results={results}
                onSelect={handleSelect}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="w-8 h-8 bg-linear-to-br from-blue-900 to-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-semibold text-gray-800">
                    {user?.name || "Administrador"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user.role}
                  </p>
                </div>
                <ChevronDown size={16} className="hidden lg:block text-gray-400" />
              </button>

              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-100">
                      <p className="font-semibold text-gray-800">{user?.name || "Administrador"}</p>
                      <p className="text-xs text-gray-500 mt-1">{user?.email || "admin@colegio.edu.ve"}</p>
                    </div>
                    <div className="py-2">
                      <Link
                        to="/"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition text-gray-700"
                      >
                        <Home size={16} />
                        <span>Home</span>
                      </Link>
                    </div>
                    <div className="border-t border-gray-100 py-2">
                      <button
                        onClick={() => { logout(); setShowUserMenu(false); }}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-red-50 transition text-red-600 w-full"
                      >
                        <LogOut size={16} />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden mt-3 relative">
          <SearchFilterComponent
            searchTerm={query}
            setSearchTerm={handleInputChange}
            placeHolder="Buscar..."
          />
          <SearchDropdown
            show={showDropdown}
            isSearching={isSearching}
            results={results}
            onSelect={handleSelect}
          />
        </div>
      </div>
    </header>
  );
}
