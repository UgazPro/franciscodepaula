import { useQuery } from "@tanstack/react-query";
import { getStudents, getStaff, getRepresentatives } from "@/services/users/user.service";

export const useStudents = (params?: {
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
    queryFn: () => getStudents(params),
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
  view?: string;
  minStudents?: number;
}) => {
  return useQuery({
    queryKey: ["representatives", params],
    queryFn: () => getRepresentatives(params),
    staleTime: 1000 * 60 * 5,
  });
};





