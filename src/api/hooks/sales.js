import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { handleError } from "@/utils/handle-error";
import * as api from "@/api/sales.api";

export const useSales = () =>
  useQuery({
    queryKey: ["sales"],
    queryFn: async () => (await api.getAllSales()).data,
  });

export const useSale = (id) =>
  useQuery({
    queryKey: ["sales", id],
    queryFn: async () => (await api.getSaleById(id)).data,
    enabled: !!id,
  });

export const useSalesSummary = () =>
  useQuery({
    queryKey: ["sales", "summary"],
    queryFn: async () => (await api.getSalesSummary()).data,
  });

export const useSalesByCustomer = (customerId) =>
  useQuery({
    queryKey: ["sales", "customer", customerId],
    queryFn: async () => (await api.getSalesByCustomerId(customerId)).data,
    enabled: !!customerId,
  });

export const useCreateSale = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createSale,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sales"] }),
    onError: (error) => handleError(error, "Failed to create sale."),
  });
};

export const useCancelSale = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.cancelSale,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sales"] }),
    onError: (error) => handleError(error, "Failed to cancel sale."),
  });
};
