import api from "./axios";

export const createLC = (data) =>
  api.post("/lc/create-lc", data);

export const getAllLCs = () =>
  api.get("/lc/get-all-lc");

export const getLCById = (id) =>
  api.get(`/lc/get-lc/${id}`);

export const updateLC = (id, data) =>
  api.patch(`/lc/update-lc/${id}`, data);

export const deleteLC = (id) =>
  api.delete(`/lc/delete-lc/${id}`);

export const addExpenseToLC = (data) =>
  api.post("/lc/add-expense", data);

export const getCompletedLCs = () =>
  api.get("/lc/completed-lc");

export const exportLCAsPDF = (id) =>
  api.get(`/lc/export-lc/${id}`, { responseType: "blob" });

export const getLCCountsByStatus = () =>
  api.get("/lc/counts/status");

export const getTotalLCCount = () =>
  api.get("/lc/counts/total");

export const getActiveLCs = () =>
  api.get("/lc/active-lc");

export const getLCSummary = (params) => {
  const { searchQuery, status } = params || {};
  // The search endpoint on the backend handles filtering by status as well,
  // so if there's any search or filter parameter, we should use the search endpoint.
  const isSearchOrFilter = searchQuery || status;

  if (isSearchOrFilter) {
    return api.get("/lc/summary/search", { params });
  }
  
  return api.get("/lc/summary", { params });
};
