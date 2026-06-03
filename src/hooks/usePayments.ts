import { useQuery } from "@tanstack/react-query";
import { getDataApi } from "@/services/api";

export const usePayments = () => {
  return useQuery({
    queryKey: ["payments"],
    queryFn: () => getDataApi("/payments"),
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
    staleTime: 1000 * 60 * 5,
    select: (data: any[]) => data?.[0] ?? null,
  });
};
