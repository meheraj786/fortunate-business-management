import api from "./axios";

export const createTransaction = (data) =>
  api.post("/transactions/create", data);

export const getAllTransactions = (params) =>
  api.get("/transactions/get-all-transactions", { params });

export const getTransactionById = (id) =>
  api.get(`/transactions/get-transaction-details/${id}`);

export const getTransactionsByAccount = (accountId, params) =>
  api.get(`/transactions/get-transactions-by-account/${accountId}`, { params });

export const deleteTransaction = (id) =>
  api.delete(`/transactions/delete/${id}`);

export const getTransactionStats = () =>
  api.get("/transactions/get-transaction-stats");

export const transferMoney = (data) => api.post("/transactions/transfer", data);
