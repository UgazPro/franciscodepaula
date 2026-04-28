import { useQuery } from "@tanstack/react-query";
import { getStudents } from "@/services/users/user.service";

export const useStudents = () => {
  return useQuery({
    queryKey: ["students"],
    queryFn: getStudents,
    staleTime: 1000 * 60 * 5,
  });
};





