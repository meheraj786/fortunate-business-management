import api from "./axios";

export const createProduct = (warehouseId, data) =>
  api.post(`/warehouses/${warehouseId}/products`, data);

export const getProductsByWarehouse = (warehouseId, params) =>
  api.get(`/warehouses/${warehouseId}/products`, { params });

export const getProductById = (warehouseId, productId) =>
  api.get(`/warehouses/${warehouseId}/products/${productId}`);

export const updateProduct = (warehouseId, productId, data) =>
  api.patch(`/warehouses/${warehouseId}/products/${productId}`, data);

export const deleteProduct = (warehouseId, productId) =>
  api.delete(`/warehouses/${warehouseId}/products/${productId}`);

export const getProductSalesHistory = (warehouseId, productId, params) =>
  api.get(`/warehouses/${warehouseId}/products/${productId}/sales`, { params });

export const getProductsForSale = (warehouseId, categoryId) => {
  const params = {};
  if (categoryId) {
    params.categoryId = categoryId;
  }
  return api.get(`/warehouses/${warehouseId}/products/for-sale`, { params });
};

export const searchProducts = (warehouseId, q, categoryId) => {
  const params = { q };
  if (categoryId) params.category = categoryId;
  return api.get(`/warehouses/${warehouseId}/products/for-sale`, { params });
};

export const closeLot = (warehouseId, productId) =>
  api.post(`/warehouses/${warehouseId}/products/${productId}/close-lot`);