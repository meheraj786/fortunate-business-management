import axiosInstance from "./axios";

export const getAuditLogs = async (params) => {
    return await axiosInstance.get("/audit", { params });
};

export const getAuditLogById = async (id) => {
    return await axiosInstance.get(`/audit/${id}`);
};
