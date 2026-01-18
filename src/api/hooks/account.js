import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "@/api/account.api";
import { useApiMutation } from "@/hooks/useApiMutation";

export const useAccounts = () =>
  useQuery({
    queryKey: ["accounts"],
    queryFn: async () => (await api.getAllAccounts()).data,
  });

export const useAccount = (id) =>
  useQuery({
    queryKey: ["accounts", id],
    queryFn: async () => (await api.getAccountById(id)).data,
    enabled: !!id,
  });

export const useAccountDetails = (id) =>
  useQuery({
    queryKey: ["accounts", "details", id],
    queryFn: async () => (await api.getAccountDetails(id)).data,
    enabled: !!id,
  });

export const useCreateAccount = () => {
  const qc = useQueryClient();
  return useApiMutation({
    mutationFn: api.createAccount,
    successMessage: "Account created successfully!",
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accounts"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["dailyCashStatus"] });
      qc.invalidateQueries({ queryKey: ["dailyCashSummary"] });
    },
  });
};

export const useUpdateAccount = () => {
  const qc = useQueryClient();
  return useApiMutation({
    mutationFn: ({ id, data }) => api.updateAccount(id, data),
    successMessage: "Account updated successfully!",
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["accounts"] });
      qc.invalidateQueries({ queryKey: ["accounts", "details", id] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["dailyCashStatus"] });
      qc.invalidateQueries({ queryKey: ["dailyCashSummary"] });
    },
  });
};

export const useDeleteAccount = () => {
  const qc = useQueryClient();
  return useApiMutation({
    mutationFn: api.deleteAccount,
    successMessage: "Account deleted successfully!",
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accounts"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["dailyCashStatus"] });
      qc.invalidateQueries({ queryKey: ["dailyCashSummary"] });
    },
  });
};
