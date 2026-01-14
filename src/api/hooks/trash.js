import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "@/api/trash.api";
import { useApiMutation } from "@/hooks/useApiMutation";


export const useTrash = (params) =>
  useQuery({
    queryKey: ["trash", params],
    queryFn: async () => (await api.getAllTrash(params)).data,
    keepPreviousData: true,
  });

export const useMoveToTrash = () => {
  const qc = useQueryClient();

  return useApiMutation({
    mutationFn: api.moveToTrash,
    successMessage: "Item moved to trash.",
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trash"] });
      qc.invalidateQueries(); 
    },
  });
};


export const useRestoreFromTrash = () => {
  const qc = useQueryClient();

  return useApiMutation({
    mutationFn: api.restoreFromTrash,
    successMessage: "Item restored successfully!",
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trash"] });
      qc.invalidateQueries();
    },
  });
};

export const useDeleteTrashPermanently = () => {
  const qc = useQueryClient();

  return useApiMutation({
    mutationFn: api.deleteTrashPermanently,
    successMessage: "Item deleted permanently!",
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trash"] });
    },
  });
};


export const useGetDetailById = ({ model, id }) =>
  useQuery({
    queryKey: ["trash", model, id],
    queryFn: async () => (await api.getTrashDetailById({ model, id })).data,
    keepPreviousData: true,
    enabled: !!model && !!id,
  });