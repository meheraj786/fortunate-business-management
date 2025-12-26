import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

export const useCreateAccount = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createAccount,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["accounts"] }),
  });
};

export const useUpdateAccount = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.updateAccount(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["accounts"] }),
  });
};

export const useDeleteAccount = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteAccount,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["accounts"] }),
  });
};
