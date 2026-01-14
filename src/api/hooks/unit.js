import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "@/api/unit.api";
import { useApiMutation } from "@/hooks/useApiMutation";

export const useUnits = () =>
  useQuery({
    queryKey: ["units"],
    queryFn: async () => (await api.getUnits()).data,
  });

export const useUnit = (id) =>
  useQuery({
    queryKey: ["units", id],
    queryFn: async () => (await api.getUnitById(id)).data,
    enabled: !!id,
  });

export const useCreateUnit = () => {
  const qc = useQueryClient();
  return useApiMutation({
    mutationFn: api.createUnit,
    successMessage: "Unit created successfully!",
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["units"] }),
  });
};

export const useUpdateUnit = () => {
  const qc = useQueryClient();
  return useApiMutation({
    mutationFn: ({ id, data }) => api.updateUnit(id, data),
    successMessage: "Unit updated successfully!",
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["units"] });
      qc.invalidateQueries({ queryKey: ["units", id] });
    },
  });
};

export const useDeleteUnit = () => {
  const qc = useQueryClient();
  return useApiMutation({
    mutationFn: api.deleteUnit,
    successMessage: "Unit deleted successfully!",
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["units"] }),
  });
};
