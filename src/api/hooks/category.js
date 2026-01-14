import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "@/api/category.api";
import { useApiMutation } from "@/hooks/useApiMutation";

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
  return useApiMutation({
    mutationFn: api.createCategory,
    successMessage: "Category created successfully!",
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
};

export const useUpdateCategory = () => {
  const qc = useQueryClient();
  return useApiMutation({
    mutationFn: ({ id, data }) => api.updateCategory(id, data),
    successMessage: "Category updated successfully!",
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      qc.invalidateQueries({ queryKey: ["categories", id] });
    }
  });
};

export const useDeleteCategory = () => {
  const qc = useQueryClient();
  return useApiMutation({
    mutationFn: api.deleteCategory,
    successMessage: "Category deleted successfully!",
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
};
