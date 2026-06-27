import { useQuery } from "@tanstack/react-query";
import { getDataApi } from "@/services/api";

export const useTeacherAssignments = () => {
  return useQuery({
    queryKey: ["teacher-assignments"],
    queryFn: () => getDataApi("/teacher-assignments"),
    staleTime: 1000 * 60 * 5,
  });
};

export const useTeachers = () => {
  return useQuery({
    queryKey: ["teachers"],
    queryFn: () => getDataApi("/users/staff/teachers"),
    staleTime: 1000 * 60 * 5,
  });
};
