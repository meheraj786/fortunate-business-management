import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "@/api/transaction.api";
import { useApiMutation } from "@/hooks/useApiMutation";

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
    queryFn: async () =>
      (await api.getTransactionsByAccount(accountId, params)).data,
    keepPreviousData: true,
    enabled: !!accountId,
  });

// Hook to fetch a single transaction's details
export const useTransaction = (id) =>
  useQuery({
    queryKey: ["transactions", id],
    queryFn: async () => (await api.getTransactionById(id)).data,
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

export const useTransactionStats = () =>
  useQuery({
    queryKey: ["transactions", "stats"],
    queryFn: async () => (await api.getTransactionStats()).data,
  });

export const useCreateTransaction = () => {
  const qc = useQueryClient();
  return useApiMutation({
    mutationFn: api.createTransaction,
    successMessage: "Transaction created successfully!",
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
  });
};

export const useDeleteTransaction = () => {
  const qc = useQueryClient();
  return useApiMutation({
    mutationFn: api.deleteTransaction,
    successMessage: "Transaction deleted successfully!",
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
  });
};

export const useTransferMoney = () => {
  const qc = useQueryClient();
  return useApiMutation({
    mutationFn: api.transferMoney,
    successMessage: "Money transferred successfully!",
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
};
