import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { handleError } from "@/utils/handle-error";
import * as api from "@/api/warehouse.api";
import toast from "react-hot-toast";

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
  return useMutation({
    mutationFn: api.createWarehouse,
    onSuccess: () => {
      toast.success("Warehouse created successfully!");
      qc.invalidateQueries({ queryKey: ["warehouses"] });
    },
    onError: (error) => handleError(error, "Failed to create warehouse."),
  });
};

export const useUpdateWarehouse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.updateWarehouse(id, data),
    onSuccess: (_, { id }) => {
      toast.success("Warehouse updated successfully!");
      qc.invalidateQueries({ queryKey: ["warehouses"] });
      qc.invalidateQueries({ queryKey: ["warehouses", id] });
    },
    onError: (error) => handleError(error, "Failed to update warehouse."),
  });
};

export const useDeleteWarehouse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteWarehouse,
    onSuccess: () => {
      toast.success("Warehouse deleted successfully!");
      qc.invalidateQueries({ queryKey: ["warehouses"] });
    },
    onError: (error) => handleError(error, "Failed to delete warehouse."),
  });
};
