import api from "./axios";

export const createProduct = (warehouseId, data) =>
  api.post(`/warehouse/${warehouseId}/products`, data);

export const getProducts = (warehouseId) =>
  api.get(`/warehouse/${warehouseId}/products`);

export const getProductById = (warehouseId, productId) =>
  api.get(`/warehouse/${warehouseId}/products/${productId}`);

export const updateProduct = (warehouseId, productId, data) =>
  api.patch(`/warehouse/${warehouseId}/products/${productId}`, data);

export const deleteProduct = (warehouseId, productId) =>
  api.delete(`/warehouse/${warehouseId}/products/${productId}`);

export const getProductSalesHistory = (warehouseId, productId) =>
  api.get(`/warehouse/${warehouseId}/products/${productId}/sales`);
