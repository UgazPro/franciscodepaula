import { useQuery } from "@tanstack/react-query";
import { getDataApi } from "@/services/api";

const accentRegex = /[\u0300-\u036f]/g;

export function useGlobalSearch(query: string) {
  const q = query.trim().toLowerCase().normalize("NFD").replace(accentRegex, "");
  return useQuery({
    queryKey: ["global-search", q],
    queryFn: () => getDataApi(`/users/search?q=${encodeURIComponent(q)}`),
    enabled: q.length >= 2,
    staleTime: 1000 * 30,
  });
}
