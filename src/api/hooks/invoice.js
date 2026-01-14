import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "@/api/invoice.api";
import { useApiMutation } from "@/hooks/useApiMutation";

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
  return useApiMutation({
    mutationFn: api.generateInvoice,
    successMessage: "Invoice generated successfully!",
    onSuccess: (_, { saleId }) => {
      qc.invalidateQueries({ queryKey: ["invoices", "sale", saleId] });
      qc.invalidateQueries({ queryKey: ["sales", saleId] });
    },
  });
};
