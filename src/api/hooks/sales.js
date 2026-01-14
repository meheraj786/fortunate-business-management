import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "@/api/sales.api";
import { useApiMutation } from "@/hooks/useApiMutation";

// For paginated, filtered, and sorted sales data
export const usePaginatedSales = (params) =>
  useQuery({
    queryKey: ["sales", "summary", params],
    queryFn: async () => (await api.getSalesSummaryTable(params)).data,
    keepPreviousData: true,
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

export const useInvoiceStatusCount = () =>
  useQuery({
    queryKey: ["sales", "invoice-status-count"],
    queryFn: async () => (await api.getInvoiceStatusCount()).data,
  });

export const useSalesByCustomer = (customerId, params) =>
  useQuery({
    queryKey: ["sales", "customer", customerId, params],
    queryFn: async () => (await api.getSalesByCustomerId(customerId, params)).data,
    enabled: !!customerId,
  });

export const useCreateSale = () => {
  const qc = useQueryClient();
  return useApiMutation({
    mutationFn: api.createSale,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sales"] });
    },
  });
};

export const useUpdateSale = (id) => {
  const qc = useQueryClient();
  return useApiMutation({
    mutationFn: (data) => api.updateSale(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sales"] });
      qc.invalidateQueries({ queryKey: ["sales", id] });
    },
  });
};

export const useDeleteSale = () => {
  const qc = useQueryClient();
  return useApiMutation({
    mutationFn: api.deleteSale,
    successMessage: "Sale deleted successfully.",
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sales"] });
    },
  });
};

export const useCancelSale = () => {
  const qc = useQueryClient();
  return useApiMutation({
    mutationFn: api.cancelSale,
    successMessage: "Sale cancelled successfully.",
    onSuccess: (_, saleId) => {
      qc.invalidateQueries({ queryKey: ["sales"] });
      qc.invalidateQueries({ queryKey: ["sales", saleId] });
    },
  });
};

export const useAddPartialPayment = (saleId) => {
  const qc = useQueryClient();
  return useApiMutation({
    mutationFn: (data) => api.addPartialPayment(saleId, data),
    successMessage: "Payment added successfully.",
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sales", saleId] });
      qc.invalidateQueries({ queryKey: ["sales", "summary"] });
    },
  });
};
