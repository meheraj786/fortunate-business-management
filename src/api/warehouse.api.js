import api from "./axios";

export const createWarehouse = (data) =>
  api.post("/warehouse", data);

export const getWarehouses = () =>
  api.get("/warehouse");

export const getWarehouseById = (id) =>
  api.get(`/warehouse/${id}`);

export const updateWarehouse = (id, data) =>
  api.patch(`/warehouse/${id}`, data);

export const deleteWarehouse = (id) =>
  api.delete(`/warehouse/${id}`);

export const getWarehouseStats = (warehouseId) =>
  api.get(`/warehouse/${warehouseId}/stats`);
