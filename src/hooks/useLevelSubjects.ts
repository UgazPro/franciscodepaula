import { useQuery } from "@tanstack/react-query";
import { getDataApi } from "@/services/api";
import { useLevels } from "./useSchoolYears";

export const useLevelSubjects = () => {
  return useQuery({
    queryKey: ["level-subjects"],
    queryFn: () => getDataApi("/subjects/levels/all"),
    staleTime: 1000 * 60 * 5,
  });
};

export { useLevels };
