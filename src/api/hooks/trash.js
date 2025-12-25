import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/api/trash.api";


export const useTrash = (params) =>
  useQuery({
    queryKey: ["trash", params],
    queryFn: async () => (await api.getAllTrash(params)).data,
    keepPreviousData: true,
  });

export const useMoveToTrash = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: api.moveToTrash,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trash"] });
      qc.invalidateQueries(); 
    },
  });
};


export const useRestoreFromTrash = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: api.restoreFromTrash,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trash"] });
      qc.invalidateQueries();
    },
  });
};

export const useDeleteTrashPermanently = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: api.deleteTrashPermanently,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trash"] });
    },
  });
};
