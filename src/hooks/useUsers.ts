import { useQuery } from "@tanstack/react-query";
import { getStudents, getStaff, getRepresentatives, type PaginatedResponse } from "@/services/users/user.service";
import { getDataApi } from "@/services/api";

export const useStudents = (params?: {
  page?: number;
  take?: number;
  search?: string;
  view?: string;
  levelId?: number;
  section?: string;
  gender?: string;
  ageMin?: number;
  ageMax?: number;
  ageExact?: number;
}) => {
  return useQuery({
    queryKey: ["students", params],
    queryFn: () => getStudents(params) as Promise<PaginatedResponse<any>>,
    staleTime: 1000 * 60 * 5,
  });
};

export const useStaff = () => {
  return useQuery({
    queryKey: ["staff"],
    queryFn: getStaff,
    staleTime: 1000 * 60 * 5,
  });
};

export const useRepresentatives = (params?: {
  page?: number;
  take?: number;
  search?: string;
  view?: string;
  minStudents?: number;
}) => {
  return useQuery({
    queryKey: ["representatives", params],
    queryFn: () => getRepresentatives(params) as Promise<PaginatedResponse<any>>,
    staleTime: 1000 * 60 * 5,
  });
};

export const useStudentById = (studentId: number | null) => {
  return useQuery({
    queryKey: ["student-detail", studentId],
    queryFn: () => getDataApi(`/users/students/${studentId}`),
    enabled: !!studentId,
    staleTime: 1000 * 60 * 2,
  });
};

export const useRoles = () => {
  return useQuery({
    queryKey: ["roles"],
    queryFn: () => getDataApi("/users/roles"),
    staleTime: 1000 * 60 * 60,
  });
};

export const useRepresentativeById = (userId: number | null) => {
  return useQuery({
    queryKey: ["representative-detail", userId],
    queryFn: () => getDataApi(`/users/representatives/${userId}`),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
};
