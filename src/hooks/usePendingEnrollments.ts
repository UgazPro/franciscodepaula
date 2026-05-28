import { useQuery } from "@tanstack/react-query";
import { getDataApi } from "@/services/api";

export const usePendingEnrollments = () => {
  return useQuery({
    queryKey: ["pending-enrollments"],
    queryFn: () => getDataApi("/enrollment/pending"),
    staleTime: 0,
  });
};
