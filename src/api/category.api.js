import api from "./axios";

export const createCategory = (data) =>
  api.post("/category/create-category", data);

export const getCategories = () =>
  api.get("/category/get-all-category");

export const getCategoryById = (id) =>
  api.get(`/category/get-category/${id}`);

export const updateCategory = (id, data) =>
  api.put(`/category/update-category/${id}`, data);

export const deleteCategory = (id) =>
  api.delete(`/category/delete-category/${id}`);
