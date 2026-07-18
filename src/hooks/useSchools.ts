import { useQuery } from "@tanstack/react-query";
import { getDataApi } from "@/services/api";

export const useSchools = () => {
  return useQuery({
    queryKey: ["schools"],
    queryFn: () => getDataApi("/schools"),
    staleTime: 1000 * 60 * 5,
  });
};
