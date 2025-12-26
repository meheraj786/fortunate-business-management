import api from "./axios";

export const createCategory = (data) =>
  api.post("/category/create", data);

export const getCategories = () =>
  api.get("/category/get");

export const getCategoryById = (id) =>
  api.get(`/category/get/${id}`);

export const updateCategory = (id, data) =>
  api.put(`/category/update/${id}`, data);

export const deleteCategory = (id) =>
  api.delete(`/category/delete/${id}`);
