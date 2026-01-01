import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { handleError } from "@/utils/handle-error";
import * as api from "@/api/sales.api";
import toast from "react-hot-toast";

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
  return useMutation({
    mutationFn: api.createSale,
    onSuccess: () => {
      toast.success("Sale created successfully!");
      qc.invalidateQueries({ queryKey: ["sales"] });
    },
    onError: (error) => handleError(error, "Failed to create sale."),
  });
};

export const useUpdateSale = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.updateSale(id, data),
    onSuccess: () => {
      toast.success("Sale updated successfully!");
      qc.invalidateQueries({ queryKey: ["sales"] });
      qc.invalidateQueries({ queryKey: ["sales", id] });
    },
    onError: (error) => handleError(error, "Failed to update sale."),
  });
};

export const useDeleteSale = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteSale,
    onSuccess: () => {
      toast.success("Sale deleted successfully.");
      qc.invalidateQueries({ queryKey: ["sales"] });
    },
    onError: (error) => handleError(error, "Failed to delete sale."),
  });
};

export const useCancelSale = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.cancelSale,
    onSuccess: (_, saleId) => {
      toast.success("Sale cancelled successfully.");
      qc.invalidateQueries({ queryKey: ["sales"] });
      qc.invalidateQueries({ queryKey: ["sales", saleId] });
    },
    onError: (error) => handleError(error, "Failed to cancel sale."),
  });
};

export const useAddPartialPayment = (saleId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.addPartialPayment(saleId, data),
    onSuccess: () => {
      toast.success("Payment added successfully!");
      qc.invalidateQueries({ queryKey: ["sales", saleId] });
      qc.invalidateQueries({ queryKey: ["sales", "summary"] });
    },
    onError: (error) => handleError(error, "Failed to add payment."),
  });
};
