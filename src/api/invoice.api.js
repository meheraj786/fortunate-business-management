import api from "./axios";

export const generateInvoice = (data) =>
  api.post("/invoice/generate", data);

export const getAllInvoices = () =>
  api.get("/invoice");

export const getInvoiceById = (id) =>
  api.get(`/invoice/${id}`);

export const getInvoicesBySaleId = (saleId) =>
  api.get(`/invoice/sale/${saleId}`);
