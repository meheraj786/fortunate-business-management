import api from "./axios";

export const createWarehouse = (data) =>
  api.post("/warehouses", data);

export const getWarehouses = () =>
  api.get("/warehouses");

export const getWarehouseById = (id) =>
  api.get(`/warehouses/${id}`);

export const updateWarehouse = (id, data) =>
  api.patch(`/warehouses/${id}`, data);

export const deleteWarehouse = (id) =>
  api.delete(`/warehouses/${id}`);

export const getWarehouseStats = (warehouseId) =>
  api.get(`/warehouses/${warehouseId}/stats`);
