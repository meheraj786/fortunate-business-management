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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
  });
};

export const useUpdateCustomer = () => {
  const qc = useQueryClient();
  return useApiMutation({
    mutationFn: ({ id, data }) => api.updateCustomer(id, data),
    successMessage: "Customer updated successfully!",
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
  });
};

export const useDeleteCustomer = () => {
  const qc = useQueryClient();
  return useApiMutation({
    mutationFn: api.deleteCustomer,
    successMessage: "Customer deleted successfully!",
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
  });
};
