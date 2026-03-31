import api from "./axios";

export const createCountry = (data) =>
  api.post("/country/create-country", data);

export const getCountries = () =>
  api.get("/country/get-all-countries");

export const getCountryById = (id) =>
  api.get(`/country/get-country/${id}`);

export const updateCountry = (id, data) =>
  api.put(`/country/update-country/${id}`, data);

export const deleteCountry = (id) =>
  api.delete(`/country/delete-country/${id}`);

export const searchCountries = (q, limit = 20) =>
  api.get("/country/search", { params: { q, limit } });
