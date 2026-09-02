import { useQuery } from "@tanstack/react-query";
import { getDataApi } from "@/services/api";

export const useScholarships = (schoolYearId?: number) => {
  return useQuery({
    queryKey: ["scholarships", schoolYearId],
    queryFn: () => {
      const params = schoolYearId ? `?schoolYearId=${schoolYearId}` : "";
      return getDataApi(`/scholarships${params}`);
    },
    staleTime: 1000 * 60 * 2,
    enabled: !!schoolYearId,
  });
};
