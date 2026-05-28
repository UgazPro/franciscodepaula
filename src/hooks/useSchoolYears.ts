import { useQuery } from "@tanstack/react-query";
import { getDataApi } from "@/services/api";

export const useSchoolYears = () => {
  return useQuery({
    queryKey: ["school-years"],
    queryFn: () => getDataApi("/school-year"),
    staleTime: 1000 * 60 * 5,
  });
};

export const useLevels = () => {
  return useQuery({
    queryKey: ["levels"],
    queryFn: () => getDataApi("/school-year/levels"),
    staleTime: 1000 * 60 * 5,
  });
};

export const useSections = () => {
  return useQuery({
    queryKey: ["sections"],
    queryFn: () => getDataApi("/school-year/sections"),
    staleTime: 1000 * 60 * 5,
  });
};
