import { useQuery } from "@tanstack/react-query";
import { getDataApi } from "@/services/api";

export function usePayrollPeriods(filters?: { payrollHalf?: number; schoolYearId?: number }) {
  const params = new URLSearchParams();
  if (filters?.payrollHalf) params.set("payrollHalf", String(filters.payrollHalf));
  if (filters?.schoolYearId) params.set("schoolYearId", String(filters.schoolYearId));
  const qs = params.toString();

  return useQuery({
    queryKey: ["payroll-periods", qs],
    queryFn: () => getDataApi(`/payroll/periods${qs ? `?${qs}` : ""}`),
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

export function usePayrollRecords(filters?: { payrollPeriodId?: number; employeeId?: number }) {
  const params = new URLSearchParams();
  if (filters?.payrollPeriodId) params.set("payrollPeriodId", String(filters.payrollPeriodId));
  if (filters?.employeeId) params.set("employeeId", String(filters.employeeId));
  const qs = params.toString();

  return useQuery({
    queryKey: ["payroll-records", qs],
    queryFn: () => getDataApi(`/payroll/records${qs ? `?${qs}` : ""}`),
    staleTime: 1000 * 60 * 5,
  });
}
