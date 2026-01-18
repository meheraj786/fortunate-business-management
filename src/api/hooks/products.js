import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "@/api/product.api";
import { useApiMutation } from "@/hooks/useApiMutation";

// Products by warehouse with filtering and pagination
export const useProducts = (warehouseId, params) =>
  useQuery({
    queryKey: ["products", warehouseId, params],
    queryFn: async () =>
      (await api.getProductsByWarehouse(warehouseId, params)).data,
    enabled: !!warehouseId,
    keepPreviousData: true,
  });

// Single product
export const useProduct = (warehouseId, productId) =>
  useQuery({
    queryKey: ["products", warehouseId, productId],
    queryFn: async () =>
      (await api.getProductById(warehouseId, productId)).data,
    enabled: !!warehouseId && !!productId,
  });

// Product sales history with pagination
export const useProductSalesHistory = (warehouseId, productId, params) =>
  useQuery({
    queryKey: ["products", "sales", productId, params],
    queryFn: async () =>
      (await api.getProductSalesHistory(warehouseId, productId, params)).data,
    enabled: !!warehouseId && !!productId,
    keepPreviousData: true,
  });

// Fetch products for sale dropdown
export const useProductsForSale = (warehouseId, categoryId, options) =>
  useQuery({
    queryKey: ["products", "for-sale", warehouseId, categoryId],
    queryFn: async () =>
      (await api.getProductsForSale(warehouseId, categoryId)).data,
    enabled: !!warehouseId,
    ...options,
  });

// Create product
export const useCreateProduct = (warehouseId) => {
  const qc = useQueryClient();
  return useApiMutation({
    mutationFn: (data) => api.createProduct(warehouseId, data),
    successMessage: "Product created successfully!",
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products", warehouseId] });
      qc.invalidateQueries({ queryKey: ["warehouses", warehouseId] });
      qc.invalidateQueries({ queryKey: ["warehouses"] }); // Invalidate warehouses to update stats
    },
  });
};

// Update product
export const useUpdateProduct = (warehouseId, productId) => {
  const qc = useQueryClient();
  return useApiMutation({
    mutationFn: (data) => api.updateProduct(warehouseId, productId, data),
    successMessage: "Product updated successfully!",
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products", warehouseId] });
      qc.invalidateQueries({ queryKey: ["products", warehouseId, productId] });
      qc.invalidateQueries({ queryKey: ["warehouses", warehouseId] });
      qc.invalidateQueries({ queryKey: ["warehouses"] }); // Invalidate warehouses to update stats
    },
  });
};

// Delete product
export const useDeleteProduct = (warehouseId, productId) => {
  const qc = useQueryClient();
  return useApiMutation({
    mutationFn: () => api.deleteProduct(warehouseId, productId),
    successMessage: "Product deleted successfully!",
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products", warehouseId] });
      qc.invalidateQueries({ queryKey: ["products", warehouseId, productId] });
      qc.invalidateQueries({ queryKey: ["warehouses", warehouseId] });
      qc.invalidateQueries({ queryKey: ["warehouses"] }); // Invalidate warehouses to update stats
      qc.invalidateQueries({ queryKey: ["trash"] }); // Invalidate trash list
    },
  });
};
