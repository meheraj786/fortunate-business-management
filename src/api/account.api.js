import api from "./axios";

export const createAccount = (data) =>
  api.post("/account/create-account", data);

export const getAllAccounts = () =>
  api.get("/account/get-all-accounts");

export const getAccountById = (id) =>
  api.get(`/account/get-account/${id}`);
  
export const getAccountDetails = (id) =>
  api.get(`/account/get-account-details/${id}`);

export const updateAccount = (id, data) =>
  api.patch(`/account/update-account/${id}`, data);

export const deleteAccount = (id) =>
  api.delete(`/account/delete-account/${id}`);
