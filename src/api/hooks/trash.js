import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { handleError } from "@/utils/handle-error";
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
    onError: (error) => handleError(error, "Failed to move to trash.", "trashError"),
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
    onError: (error) => handleError(error, "Failed to restore from trash.", "trashError"),
  });
};

export const useDeleteTrashPermanently = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: api.deleteTrashPermanently,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trash"] });
    },
    onError: (error) => handleError(error, "Failed to delete permanently.", "trashError"),
  });
};


export const useGetDetailById = ({ model, id }) =>
  useQuery({
    queryKey: ["trash", model, id],
    queryFn: async () => (await api.getTrashDetailById({ model, id })).data,
    keepPreviousData: true,
    enabled: !!model && !!id,
  });