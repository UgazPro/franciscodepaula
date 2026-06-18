import { useQuery } from "@tanstack/react-query";
import { getDataApi } from "@/services/api";
import type { PaymentFilters } from "@/stores/payments.store";

export interface PaymentsQueryParams extends PaymentFilters {
  page?: number;
  take?: number;
  search?: string;
}

export const usePayments = (filters?: PaymentsQueryParams) => {
  const params = new URLSearchParams();

  if (filters?.page !== undefined) params.set("page", String(filters.page));
  if (filters?.take !== undefined) params.set("take", String(filters.take));
  if (filters?.search) params.set("search", filters.search);

  if (filters?.dateMode === "exact" && filters?.exactDate) {
    params.set("exactDate", filters.exactDate);
  } else {
    if (filters?.startDate) params.set("startDate", filters.startDate);
    if (filters?.endDate) params.set("endDate", filters.endDate);
  }

  if (filters?.feeId) params.set("feeId", String(filters.feeId));
  if (filters?.paymentMethodId) params.set("paymentMethodId", String(filters.paymentMethodId));
  if (filters?.studentSearch) params.set("studentSearch", filters.studentSearch);
  if (filters?.representativeSearch) params.set("representativeSearch", filters.representativeSearch);
  if (filters?.morosos) params.set("morosos", "true");
  if (filters?.studentId) params.set("studentId", String(filters.studentId));
  if (filters?.schoolYearId) params.set("schoolYearId", String(filters.schoolYearId));

  const qs = params.toString();

  return useQuery({
    queryKey: ["payments", qs],
    queryFn: () => getDataApi(`/payments${qs ? `?${qs}` : ""}`),
    staleTime: 1000 * 60 * 5,
  });
};

export const usePaymentMethods = () => {
  return useQuery({
    queryKey: ["payment-methods"],
    queryFn: () => getDataApi("/payments/payment-methods"),
    staleTime: 1000 * 60 * 5,
  });
};

export const useFees = () => {
  return useQuery({
    queryKey: ["fees"],
    queryFn: () => getDataApi("/payments/fees"),
    staleTime: 1000 * 60 * 5,
  });
};

export const useExchangeRate = () => {
  return useQuery({
    queryKey: ["exchange-rate"],
    queryFn: () => getDataApi("/payments/exchange"),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: 1000 * 60 * 60,
  });
};
