import api from "./axios";

export const createSale = (data) =>
  api.post("/sales/create-sales", data);

export const getAllSales = () =>
  api.get("/sales/get-all-sales");

export const getSaleById = (id) =>
  api.get(`/sales/get-sales/${id}`);

export const updateSale = (id, data) =>
  api.patch(`/sales/update-sale/${id}`, data);

export const deleteSale = (id) =>
  api.delete(`/sales/delete-sale/${id}`);

export const cancelSale = (id) =>
  api.patch(`/sales/cancel-sale/${id}`);

export const getSalesSummary = () =>
  api.get("/sales/sales-summary");

export const getSalesByCustomerId = (customerId, params) =>
  api.get(`/sales/customer/${customerId}`, { params });

export const getInvoiceStatusCount = () =>
  api.get("/sales/get-all-invoices-status-count");

export const addPartialPayment = (id, data) =>
  api.post(`/sales/${id}/payments`, data);

export const getSalesSummaryTable = (params) =>
  api.get("/sales/sales-summary-table", { params });
