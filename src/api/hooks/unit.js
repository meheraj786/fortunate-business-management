import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { handleError } from "@/utils/handle-error";
import * as api from "@/api/unit.api";

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
  return useMutation({
    mutationFn: api.createUnit,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["units"] }),
    onError: (error) => handleError(error, "Failed to create unit.", "unitError"),
  });
};

export const useUpdateUnit = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.updateUnit(id, data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["units"] }),
    onError: (error) => handleError(error, "Failed to update unit.", "unitError"),
  });
};

export const useDeleteUnit = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteUnit,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["units"] }),
    onError: (error) => handleError(error, "Failed to delete unit.", "unitError"),
  });
};
