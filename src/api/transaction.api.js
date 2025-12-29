import api from "./axios";

export const createTransaction = (data) =>
  api.post("/transactions/create", data);

export const getAllTransactions = () =>
  api.get("/transactions/get-all");

export const getTransactionById = (id) =>
  api.get(`/transactions/get/${id}`);

export const getTransactionsByAccount = (accountId) =>
  api.get(`/transactions/get-by-account/${accountId}`);

export const deleteTransaction = (id) =>
  api.delete(`/transactions/delete/${id}`);

export const getTransactionStats = () =>
  api.get("/transactions/get-stats");
