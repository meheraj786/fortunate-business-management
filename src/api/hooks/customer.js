import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { handleError } from "@/utils/handle-error";
import * as api from "@/api/customer.api";
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
  return useMutation({
    mutationFn: api.createCustomer,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
    onError: (error) => handleError(error, "Failed to create customer."),
  });
};

export const useUpdateCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.updateCustomer(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
    onError: (error) => handleError(error, "Failed to update customer."),
  });
};

export const useDeleteCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteCustomer,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
    onError: (error) => handleError(error, "Failed to delete customer."),
  });
};
