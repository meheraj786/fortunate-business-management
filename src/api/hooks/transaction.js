import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { handleError } from "@/utils/handle-error";
import * as api from "@/api/transaction.api";

// Hook to fetch a paginated, sorted, and filtered list of all transactions
export const useTransactions = (params) =>
  useQuery({
    queryKey: ["transactions", params],
    queryFn: async () => (await api.getAllTransactions(params)).data,
    keepPreviousData: true,
  });

// Hook to fetch a paginated, sorted, and filtered list of transactions for a specific account
export const useAccountTransactions = (accountId, params) =>
  useQuery({
    queryKey: ["transactions", "account", accountId, params],
    queryFn: async () => (await api.getTransactionsByAccount(accountId, params)).data,
    keepPreviousData: true,
    enabled: !!accountId,
  });

// Hook to fetch a single transaction's details
export const useTransaction = (id) =>
  useQuery({
    queryKey: ["transactions", id],
    queryFn: async () => (await api.getTransactionById(id)).data,
    enabled: !!id,
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
    onError: (error) => handleError(error, "Failed to create transaction."),
  });
};

export const useDeleteTransaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteTransaction,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
    onError: (error) => handleError(error, "Failed to delete transaction."),
  });
};
