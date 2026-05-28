import { useQuery } from "@tanstack/react-query";
import { getStudents, getStaff } from "@/services/users/user.service";

export const useStudents = () => {
  return useQuery({
    queryKey: ["students"],
    queryFn: getStudents,
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





