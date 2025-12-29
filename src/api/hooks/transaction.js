import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/api/transaction.api";

export const useTransactions = () =>
  useQuery({
    queryKey: ["transactions"],
    queryFn: async () => (await api.getAllTransactions()).data,
  });

export const useTransactionStats = () =>
  useQuery({
    queryKey: ["transactions", "stats"],
    queryFn: async () => (await api.getTransactionStats()).data,
  });

export const useCreateTransaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createTransaction,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
  });
};

export const useDeleteTransaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteTransaction,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
  });
};
