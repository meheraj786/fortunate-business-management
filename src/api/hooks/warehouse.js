import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "@/api/warehouse.api";
import { useApiMutation } from "@/hooks/useApiMutation";

export const useWarehouses = () =>
  useQuery({
    queryKey: ["warehouses"],
    queryFn: async () => (await api.getWarehouses()).data,
  });

export const useWarehouse = (id) =>
  useQuery({
    queryKey: ["warehouses", id],
    queryFn: async () => (await api.getWarehouseById(id)).data,
    enabled: !!id,
  });

export const useCreateWarehouse = () => {
  const qc = useQueryClient();
  return useApiMutation({
    mutationFn: api.createWarehouse,
    successMessage: "Warehouse created successfully!",
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["warehouses"] });
    },
  });
};

export const useUpdateWarehouse = () => {
  const qc = useQueryClient();
  return useApiMutation({
    mutationFn: ({ id, data }) => api.updateWarehouse(id, data),
    successMessage: "Warehouse updated successfully!",
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["warehouses"] });
      qc.invalidateQueries({ queryKey: ["warehouses", id] });
    },
  });
};

export const useDeleteWarehouse = () => {
  const qc = useQueryClient();
  return useApiMutation({
    mutationFn: api.deleteWarehouse,
    successMessage: "Warehouse deleted successfully!",
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["warehouses"] });
    },
  });
};
