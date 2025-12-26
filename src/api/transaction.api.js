import api from "./axios";

export const createTransaction = (data) =>
  api.post("/transaction/create", data);

export const getAllTransactions = () =>
  api.get("/transaction/get-all");

export const getTransactionById = (id) =>
  api.get(`/transaction/get/${id}`);

export const getTransactionsByAccount = (accountId) =>
  api.get(`/transaction/get-by-account/${accountId}`);

export const deleteTransaction = (id) =>
  api.delete(`/transaction/delete/${id}`);

export const getTransactionStats = () =>
  api.get("/transaction/get-stats");
