import { useQuery } from "@tanstack/react-query";
import { getDataApi } from "@/services/api";

export function useStudentsWithDebts() {
  return useQuery({
    queryKey: ["students-with-debts"],
    queryFn: () => getDataApi("/payments/students-with-debts"),
    staleTime: 1000 * 60 * 5,
  });
}
