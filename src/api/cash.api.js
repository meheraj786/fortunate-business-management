import api from "./axios";

export const openDailyCash = (data) => api.post("/cash/open", data);

export const addIncome = (data) => api.post("/cash/income", data);

export const addExpense = (data) => api.post("/cash/expense", data);

export const closeDailyCash = () => api.post("/cash/close");

export const updateTransaction = (date, data) =>
  api.put(`/cash/update/${date}`, data);

export const getDailyCashStatus = (params) =>
  api.get("/cash/status", { params });

export const getDailyCashSummary = (params) =>
  api.get("/cash/summary", { params });

export const getTransactionsByDateRange = (params) =>
  api.get("/cash/filter", { params });
