import api from "./axios";


export const moveToTrash = (data) =>
  api.post("/trash/move-to-trash", data);

export const getAllTrash = (params) =>
  api.get("/trash/get", { params });


export const restoreFromTrash = ({model, id}) =>
  api.post(`/trash/${model}/${id}/restore`);


export const deleteTrashPermanently = (id) =>
  api.delete(`/trash/delete/${id}`);


export const getTrashDetailById = (id) =>
  api.get(`/trash/get-detail/${id}`);
