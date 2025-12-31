import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { handleError } from "@/utils/handle-error";
import * as api from "@/api/cash.api";

export const useDailyCash = () =>
  useQuery({
    queryKey: ["cash"],
    queryFn: async () => (await api.getDailyCash()).data,
  });

export const useAddIncome = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.addIncome,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cash"] }),
    onError: (error) => handleError(error, "Failed to add income."),
  });
};

export const useAddExpense = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.addExpense,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cash"] }),
    onError: (error) => handleError(error, "Failed to add expense."),
  });
};
