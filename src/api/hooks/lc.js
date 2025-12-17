import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/api/lc.api";

export const useLCs = () =>
  useQuery({
    queryKey: ["lcs"],
    queryFn: async () => (await api.getAllLCs()).data,
  });

export const useLCSummary = () =>
  useQuery({
    queryKey: ["lcs", "summary"],
    queryFn: async () => (await api.getLCSummary()).data,
  });

export const useCreateLC = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createLC,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lcs"] }),
  });
};
