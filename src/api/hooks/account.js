import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { handleError } from "@/utils/handle-error";
import * as api from "@/api/account.api";

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
  return useMutation({
    mutationFn: api.createAccount,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["accounts"] }),
    onError: (error) => handleError(error, "Failed to create account."),
  });
};

export const useUpdateAccount = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.updateAccount(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["accounts"] });
      qc.invalidateQueries({ queryKey: ["accounts", "details", id] });
    },
    onError: (error) => handleError(error, "Failed to update account."),
  });
};

export const useDeleteAccount = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteAccount,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["accounts"] }),
    onError: (error) => handleError(error, "Failed to delete account."),
  });
};
