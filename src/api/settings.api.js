import api from "./axios";

export const getSystemSettings = async () => {
  const { data } = await api.get("/settings/get-settings");
  return data;
};

export const updateSystemSettings = async (settingsData) => {
  const { data } = await api.patch("/settings/update-settings", settingsData);
  return data;
};
