import { useQuery } from "@tanstack/react-query";
import { getDataApi } from "@/services/api";

export function usePayrollPeriods(filters?: { month?: number; year?: number; half?: string }) {
  const params = new URLSearchParams();
  if (filters?.month) params.set("month", String(filters.month));
  if (filters?.year) params.set("year", String(filters.year));
  if (filters?.half) params.set("half", filters.half);
  const qs = params.toString();

  return useQuery({
    queryKey: ["payroll-periods", qs],
    queryFn: () => getDataApi(`/payroll/periods${qs ? `?${qs}` : ""}`),
    staleTime: 1000 * 60 * 5,
  });
}

export function usePayrollEmployees() {
  return useQuery({
    queryKey: ["payroll-employees"],
    queryFn: () => getDataApi("/payroll/employees"),
    staleTime: 1000 * 60 * 5,
  });
}

export function usePayrollPreview(periodId: number | null) {
  return useQuery({
    queryKey: ["payroll-preview", periodId],
    queryFn: () => getDataApi(`/payroll/preview?payrollPeriodId=${periodId}`),
    enabled: !!periodId,
    staleTime: 1000 * 60 * 2,
  });
}

export function usePayrollRecords(filters?: { payrollPeriodId?: number; employeeId?: number; month?: number; year?: number; half?: string }) {
  const params = new URLSearchParams();
  if (filters?.payrollPeriodId) params.set("payrollPeriodId", String(filters.payrollPeriodId));
  if (filters?.employeeId) params.set("employeeId", String(filters.employeeId));
  if (filters?.month) params.set("month", String(filters.month));
  if (filters?.year) params.set("year", String(filters.year));
  if (filters?.half) params.set("half", filters.half);
  const qs = params.toString();

  return useQuery({
    queryKey: ["payroll-records", qs],
    queryFn: () => getDataApi(`/payroll/records${qs ? `?${qs}` : ""}`),
    staleTime: 1000 * 60 * 5,
  });
}
