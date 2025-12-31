import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { handleError } from "@/utils/handle-error";
import * as api from "@/api/category.api";

export const useCategories = () =>
  useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.getCategories()).data,
  });

export const useCategory = (id) =>
  useQuery({
    queryKey: ["categories", id],
    queryFn: async () => (await api.getCategoryById(id)).data,
    enabled: !!id,
  });

export const useCreateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
    onError: (error) => handleError(error, "Failed to create category."),
  });
};

export const useUpdateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.updateCategory(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
    onError: (error) => handleError(error, "Failed to update category."),
  });
};

export const useDeleteCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
    onError: (error) => handleError(error, "Failed to delete category."),
  });
};
