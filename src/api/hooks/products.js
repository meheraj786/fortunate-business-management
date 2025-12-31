import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { handleError } from "@/utils/handle-error";
import * as api from "@/api/product.api";

// Products by warehouse
export const useProducts = (warehouseId) =>
  useQuery({
    queryKey: ["products", warehouseId],
    queryFn: async () =>
      (await api.getProductsByWarehouse(warehouseId)).data,
    enabled: !!warehouseId,
  });

// Single product
export const useProduct = (warehouseId, productId) =>
  useQuery({
    queryKey: ["products", warehouseId, productId],
    queryFn: async () =>
      (await api.getProductById(warehouseId, productId)).data,
    enabled: !!warehouseId && !!productId,
  });

// Product sales history
export const useProductSalesHistory = (warehouseId, productId) =>
  useQuery({
    queryKey: ["products", "sales", productId],
    queryFn: async () =>
      (await api.getProductSalesHistory(warehouseId, productId)).data,
    enabled: !!warehouseId && !!productId,
  });

// Create product
export const useCreateProduct = (warehouseId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      api.createProduct(warehouseId, data),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: ["products", warehouseId],
      }),
    onError: (error) => handleError(error, "Failed to create product."),
  });
};

// Update product
export const useUpdateProduct = (warehouseId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, data }) =>
      api.updateProduct(warehouseId, productId, data),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: ["products", warehouseId],
      }),
    onError: (error) => handleError(error, "Failed to update product."),
  });
};

// Delete product
export const useDeleteProduct = (warehouseId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId) =>
      api.deleteProduct(warehouseId, productId),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: ["products", warehouseId],
      }),
    onError: (error) => handleError(error, "Failed to delete product."),
  });
};
