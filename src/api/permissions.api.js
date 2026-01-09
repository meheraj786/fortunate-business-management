import api from "./axios";

export const getPermissions = () => api.get("/permissions");
