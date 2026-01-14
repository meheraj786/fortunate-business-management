import api from "./axios";

export const createCustomer = (formData) =>
  api.post("/customer/create-customer", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getCustomers = () =>
  api.get("/customer/get-active-customers");

export const getCustomerById = (id) =>
  api.get(`/customer/get-customer/${id}`);

export const updateCustomer = (id, formData) =>
  api.patch(`/customer/update-customer/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteCustomer = (id) =>
  api.delete(`/customer/delete-customer/${id}`);

export const getCustomerStats = () =>
  api.get("/customer/get-customer-stats");

export const getCustomersSummary = (params) =>
  api.get("/customer/summary", {params} );

export const deleteCustomerDocument = (customerId, docId) =>
    api.delete(`/customer/${customerId}/documents/${docId}`);
    
export const downloadCustomerDocument = (customerId, docId) =>
    api.get(`/customer/${customerId}/documents/${docId}`, { responseType: 'blob' });
