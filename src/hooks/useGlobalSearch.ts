import { useQuery } from "@tanstack/react-query";
import { getDataApi } from "@/services/api";

export function useGlobalSearch(query: string) {
  return useQuery({
    queryKey: ["global-search", query],
    queryFn: () => getDataApi(`/users/search?q=${encodeURIComponent(query)}`),
    enabled: query.length >= 2,
    staleTime: 1000 * 30,
  });
}
