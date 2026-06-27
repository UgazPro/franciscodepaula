import { useQuery } from "@tanstack/react-query";
import { getDataApi } from "@/services/api";

export const useSubjects = () => {
  return useQuery({
    queryKey: ["subjects"],
    queryFn: () => getDataApi("/subjects"),
    staleTime: 1000 * 60 * 5,
  });
};
