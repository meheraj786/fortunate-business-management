import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { handleError } from "@/utils/handle-error";
import * as api from "@/api/product.api";
import toast from "react-hot-toast";

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
  return useMutation({
    mutationFn: (data) => api.createProduct(warehouseId, data),
    onSuccess: () => {
      toast.success("Product created successfully!");
      qc.invalidateQueries({ queryKey: ["products", warehouseId] });
      qc.invalidateQueries({ queryKey: ["warehouses"] }); // Invalidate warehouses to update stats
    },
    onError: (error) => handleError(error, "Failed to create product.", "productError"),
  });
};

// Update product
export const useUpdateProduct = (warehouseId, productId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.updateProduct(warehouseId, productId, data),
    onSuccess: () => {
      toast.success("Product updated successfully!");
      qc.invalidateQueries({ queryKey: ["products", warehouseId] });
      qc.invalidateQueries({ queryKey: ["products", warehouseId, productId] });
      qc.invalidateQueries({ queryKey: ["warehouses"] }); // Invalidate warehouses to update stats
    },
    onError: (error) => handleError(error, "Failed to update product.", "productError"),
  });
};

// Delete product
export const useDeleteProduct = (warehouseId, productId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.deleteProduct(warehouseId, productId),
    onSuccess: () => {
      toast.success("Product deleted successfully!");
      qc.invalidateQueries({ queryKey: ["products", warehouseId] });
      qc.invalidateQueries({ queryKey: ["products", warehouseId, productId] });
      qc.invalidateQueries({ queryKey: ["warehouses"] }); // Invalidate warehouses to update stats
    },
    onError: (error) => handleError(error, "Failed to delete product.", "productError"),
  });
};