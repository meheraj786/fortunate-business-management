import api from "./axios";

export const createCustomer = (data) =>
  api.post("/customer/create-customer", data);

export const getCustomers = () =>
  api.get("/customer/get-active-customers");

export const getCustomerById = (id) =>
  api.get(`/customer/get-customer/${id}`);

export const updateCustomer = (id, data) =>
  api.patch(`/customer/update-customer/${id}`, data);

export const deleteCustomer = (id) =>
  api.delete(`/customer/delete-customer/${id}`);

export const getCustomerStats = () =>
  api.get("/customer/get-customer-stats");

export const getCustomersSummary = (params) =>
  api.get("/customer/summary", {params} );
