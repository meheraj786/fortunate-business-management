import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { showErrorToast } from "@/utils/notifications";

import * as api from "@/api/cash.api";

export const useDailyCashStatus = (date) =>
  useQuery({
    queryKey: ["dailyCashStatus", date],
    queryFn: async () => (await api.getDailyCashStatus({ date })).data.data,
    enabled: !!date,
    staleTime: 5 * 60 * 1000,
  });

export const useDailyCashSummary = (date) =>
  useQuery({
    queryKey: ["dailyCashSummary", date],
    queryFn: async () => (await api.getDailyCashSummary({ date })).data.data,
    enabled: !!date,
    staleTime: 5 * 60 * 1000,
  });

export const useAddIncome = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.addIncome,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cash"] }),
    onError: (error) => showErrorToast(error, "Failed to add income."),
  });
};

export const useAddExpense = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.addExpense,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cash"] }),
    onError: (error) => showErrorToast(error, "Failed to add expense."),
  });
};
