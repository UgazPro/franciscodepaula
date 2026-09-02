import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postDataApi, putDataApi } from "@/services/api";
import type { CreatePayrollPeriodDTO, GeneratePayrollDTO } from "@/services/payroll/payroll.types";

export const useCreatePayrollPeriod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePayrollPeriodDTO) => postDataApi("/payroll/periods", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-periods"] });
    },
  });
};

export const useGeneratePayroll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: GeneratePayrollDTO) => postDataApi("/payroll/generate", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-records"] });
      queryClient.invalidateQueries({ queryKey: ["payroll-periods"] });
    },
  });
};

export const useMarkAsPaid = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data?: { paymentDate?: string } }) =>
      putDataApi(`/payroll/records/${id}/pay`, data ?? {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-records"] });
    },
  });
};
