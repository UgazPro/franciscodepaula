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

export const useChargeTypes = () => {
  return useQuery({
    queryKey: ["charge-types"],
    queryFn: () => getDataApi("/payments/charge-types"),
    staleTime: 1000 * 60 * 5,
  });
};
