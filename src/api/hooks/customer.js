import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "@/api/customer.api";
import { useApiMutation } from "@/hooks/useApiMutation";
import { getCustomersSummary } from "../customer.api";

export const useCustomers = () =>
  useQuery({
    queryKey: ["customers"],
    queryFn: async () => (await api.getCustomers()).data,
  });

export const useCustomer = (id) =>
  useQuery({
    queryKey: ["customers", id],
    queryFn: async () => (await api.getCustomerById(id)).data,
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

export const useCustomerStats = () =>
  useQuery({
    queryKey: ["customers", "stats"],
    queryFn: async () => (await api.getCustomerStats()).data,
  });

export const useCustomerSummary = (params) => {
  return useQuery({
    queryKey: ["customers", "summary", params],
    queryFn: async () => {
      const res = await getCustomersSummary(params);
      return res.data;
    },
    keepPreviousData: true,
  });
};

export const useCreateCustomer = () => {
  const qc = useQueryClient();
  return useApiMutation({
    mutationFn: api.createCustomer,
    successMessage: "Customer created successfully!",
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      qc.invalidateQueries({ queryKey: ["customers", "stats"] });
    },
  });
};

export const useUpdateCustomer = () => {
  const qc = useQueryClient();
  return useApiMutation({
    mutationFn: ({ id, data }) => api.updateCustomer(id, data),
    successMessage: "Customer updated successfully!",
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      qc.invalidateQueries({ queryKey: ["customers", "stats"] });
    },
  });
};

export const useDeleteCustomer = () => {
  const qc = useQueryClient();
  return useApiMutation({
    mutationFn: api.deleteCustomer,
    successMessage: "Customer deleted successfully!",
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      qc.invalidateQueries({ queryKey: ["customers", "stats"] });
    },
  });
};

export const useDeleteCustomerDocument = () => {
  const qc = useQueryClient();
  return useApiMutation({
    mutationFn: ({ customerId, docId }) =>
      api.deleteCustomerDocument(customerId, docId),
    successMessage: "Document deleted successfully!",
    onSuccess: (_, vars) =>
      qc.invalidateQueries({ queryKey: ["customers", vars.customerId] }),
  });
};
