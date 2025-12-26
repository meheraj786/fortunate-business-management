import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/api/warehouse.api";

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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["warehouses"] }),
  });
};
