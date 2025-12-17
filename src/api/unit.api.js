import api from "./axios";

export const createUnit = (data) =>
  api.post("/unit/create", data);

export const getUnits = () =>
  api.get("/unit/get");

export const getUnitById = (id) =>
  api.get(`/unit/get/${id}`);

export const updateUnit = (id, data) =>
  api.put(`/unit/update/${id}`, data);

export const deleteUnit = (id) =>
  api.delete(`/unit/delete/${id}`);
