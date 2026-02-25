import api from "./axios";

export const createAdvancePayment = (data) =>
    api.post("/advance-payments", data);

export const getAllAdvancePayments = (params) =>
    api.get("/advance-payments", { params });

export const getAdvancePaymentById = (id) =>
    api.get(`/advance-payments/${id}`);

export const getAdvancePaymentStats = () =>
    api.get("/advance-payments/stats");

export const settleAdvancePayment = (id, data) =>
    api.put(`/advance-payments/${id}/settle`, data);

export const refundAdvancePayment = (id, data) =>
    api.put(`/advance-payments/${id}/refund`, data);

export const addToAdvancePayment = (id, data) =>
    api.put(`/advance-payments/${id}/add`, data);

export const deleteAdvancePayment = (id) =>
    api.delete(`/advance-payments/${id}`);
