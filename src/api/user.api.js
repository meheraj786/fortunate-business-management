import api from "./axios";

export const registerUser = (data) =>
  api.post("/user/create-user", data);

export const loginUser = (data) =>
  api.post("/user/login", data);

export const logoutUser = () =>
  api.post("/user/logout");

export const getProfile = () =>
  api.get("/user/get-profile");

export const getUsers = () =>
  api.get("/user/get-users");

export const getUserById = (id) =>
  api.get(`/user/get-user/${id}`);

export const updateUser = (id, data) =>
  api.patch(`/user/update-user/${id}`, data);

export const refreshToken = () =>
  api.post("/user/refresh-token");
