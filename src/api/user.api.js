import api from "./axios";

export const registerUser = (data) =>
  api.post("/auth/create-user", data);

export const loginUser = (data) =>
  api.post("/auth/login", data);

export const logoutUser = () =>
  api.post("/auth/logout");

export const getProfile = () =>
  api.get("/auth/get-profile");

export const getUsers = () =>
  api.get("/auth/get-users");

export const getUserById = (id) =>
  api.get(`/auth/get-user/${id}`);

export const updateUser = (id, data) =>
  api.patch(`/auth/update-user/${id}`, data);
