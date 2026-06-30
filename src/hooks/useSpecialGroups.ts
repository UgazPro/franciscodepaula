import { useQuery } from "@tanstack/react-query";
import { getDataApi } from "@/services/api";

export const useSpecialGroups = () => {
  return useQuery({
    queryKey: ["special-groups"],
    queryFn: () => getDataApi("/teacher-assignments/special-groups"),
    staleTime: 1000 * 60 * 5,
  });
};

export const useSpecialGroupStudents = (groupName: string | null) => {
  return useQuery({
    queryKey: ["special-group-students", groupName],
    queryFn: () => getDataApi(`/teacher-assignments/special-groups/${groupName}/students`),
    staleTime: 1000 * 60 * 5,
    enabled: !!groupName,
  });
};

export const useAvailableStudentsForCRP = () => {
  return useQuery({
    queryKey: ["available-students-crp"],
    queryFn: () => getDataApi("/teacher-assignments/special-groups/available-students"),
    staleTime: 1000 * 60 * 5,
  });
};
