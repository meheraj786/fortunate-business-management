import api from "./axios";

export const createUnit = (data) =>
  api.post("/unit/create-unit", data);

export const getUnits = () =>
  api.get("/unit/get-all-units");

export const getUnitById = (id) =>
  api.get(`/unit/get-unit/${id}`);

export const updateUnit = (id, data) =>
  api.put(`/unit/update-unit/${id}`, data);

export const deleteUnit = (id) =>
  api.delete(`/unit/delete-unit/${id}`);
