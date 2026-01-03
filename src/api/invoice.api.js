import api from "./axios";

export const generateInvoice = (data) =>
  api.post("/invoice/generate", data);

export const getAllInvoices = () =>
  api.get("/invoice");

export const getInvoiceById = (id) =>
  api.get(`/invoice/${id}`);

export const getInvoicesBySaleId = (saleId) =>
  api.get(`/invoice/sale/${saleId}`);

export const getInvoiceAsPNG = (invoiceId) =>
  api.get(`/sales/invoice/${invoiceId}/png`, {
    responseType: 'blob', // Important: tells axios to handle the response as a file blob
  });

export const getInvoiceAsPDF = (invoiceId) =>
  api.get(`/sales/invoice/${invoiceId}/pdf`, {
    responseType: 'blob',
  });
