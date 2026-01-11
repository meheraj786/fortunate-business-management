import api from "./axios";


export const moveToTrash = (data) =>
  api.post("/trash/move-to-trash", data);

export const getAllTrash = ({ module, ...params }) =>
  api.get(`/trash/${module}`, { params });


export const restoreFromTrash = ({model, id}) =>
  api.post(`/trash/${model}/${id}/restore`);


export const deleteTrashPermanently = ({model, id}) =>
  api.delete(`/trash/${model}/${id}`);


export const getTrashDetailById = ({model, id}) =>
  api.get(`/trash/${model}/${id}`);
