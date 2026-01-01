import api from "./axios";

export const createProduct = (warehouseId, data) =>
  api.post(`/warehouse/${warehouseId}/products`, data);

export const getProductsByWarehouse = (warehouseId, params) =>
  api.get(`/warehouse/${warehouseId}/products`, { params });

export const getProductById = (warehouseId, productId) =>
  api.get(`/warehouse/${warehouseId}/products/${productId}`);

export const updateProduct = (warehouseId, productId, data) =>
  api.patch(`/warehouse/${warehouseId}/products/${productId}`, data);

export const deleteProduct = (warehouseId, productId) =>
  api.delete(`/warehouse/${warehouseId}/products/${productId}`);

export const getProductSalesHistory = (warehouseId, productId, params) =>
  api.get(`/warehouse/${warehouseId}/products/${productId}/sales`, { params });

