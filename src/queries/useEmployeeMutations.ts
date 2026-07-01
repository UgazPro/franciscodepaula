import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postDataApi, putDataApi } from "@/services/api";
import type { EmployeeFormValues } from "@/services/employee/employee.schema";

export const useCreateEmployee = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ data }: { data: EmployeeFormValues }) =>
      postDataApi("/users/employees", data as unknown as Record<string, unknown>),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["staff"] });
    },
  });
};

export const useUpdateEmployee = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<EmployeeFormValues> }) =>
      putDataApi(`/users/employees/${id}`, data as unknown as Record<string, unknown>),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["staff"] });
    },
  });
};
