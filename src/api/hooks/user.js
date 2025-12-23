import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  loginUser,
  logoutUser,
  getProfile,
  getUsers,
  getUserById,
  updateUser,
} from "@/api/user.api";
import { registerUser } from "../user.api";

export const useProfile = () =>
  useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await getProfile()).data,
  });

export const useLogin = () =>
  useMutation({
    mutationFn: loginUser,
  });

export const useLogout = () =>
  useMutation({
    mutationFn: logoutUser,
  });

export const useUsers = () =>
  useQuery({
    queryKey: ["users"],
    queryFn: async () => (await getUsers()).data,
  });

export const useUser = (id) =>
  useQuery({
    queryKey: ["users", id],
    queryFn: async () => (await getUserById(id)).data,
    enabled: !!id,
  });

export const useUpdateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateUser(id, data),
    onSuccess: (response, variables) => {
      const updatedUser = response.data;
      
      qc.invalidateQueries({ queryKey: ["users"] });
      
      const currentProfile = qc.getQueryData(["profile"]);
      
      if (currentProfile && currentProfile.id === variables.id) {
        console.log("Updating profile cache with:", updatedUser);
        qc.setQueryData(["profile"], updatedUser);
      }
      
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};

export const useCreateUser = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: registerUser, 
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
};