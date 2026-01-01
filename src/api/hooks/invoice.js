import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { handleError } from "@/utils/handle-error";
import * as api from "@/api/invoice.api";
import toast from "react-hot-toast";

export const useInvoice = (id) =>
  useQuery({
    queryKey: ["invoices", id],
    queryFn: async () => (await api.getInvoiceById(id)).data,
    enabled: !!id,
  });

export const useInvoicesBySale = (saleId) =>
  useQuery({
    queryKey: ["invoices", "sale", saleId],
    queryFn: async () => (await api.getInvoicesBySaleId(saleId)).data,
    enabled: !!saleId,
  });

export const useGenerateInvoice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.generateInvoice,
    onSuccess: (_, { saleId }) => {
      toast.success("Invoice generated successfully!");
      qc.invalidateQueries({ queryKey: ["invoices", "sale", saleId] });
      qc.invalidateQueries({ queryKey: ["sales", saleId] });
    },
    onError: (error) => handleError(error, "Failed to generate invoice."),
  });
};
