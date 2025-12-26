import api from "./axios";


export const moveToTrash = (data) =>
  api.post("/trash/move-to-trash", data);

export const getAllTrash = (params) =>
  api.get("/trash/get", { params });


export const restoreFromTrash = (id) =>
  api.post(`/trash/restore/${id}`);


export const deleteTrashPermanently = (id) =>
  api.delete(`/trash/delete/${id}`);
