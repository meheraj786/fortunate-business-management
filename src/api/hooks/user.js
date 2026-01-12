import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { handleError } from "@/utils/handle-error";
import {
  loginUser,
  logoutUser,
  getProfile,
  getUsers,
  getUserById,
  updateUser,
  registerUser
} from "@/api/user.api";

export const useProfile = () =>
  useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      try {
        const response = await getProfile();
        return response.data.data;
      } catch (error) {
        // If unauthorized or token invalid, return null
        if (error.response?.status === 401) {
          return null;
        }
        throw error;
      }
    },
    retry: false, // Don't retry on auth errors
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

export const useLogin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: loginUser,
    onSuccess: (response) => {
      // Manually set the profile data from the login response
      qc.setQueryData(["profile"], response.data);
    },
    onError: (error) => handleError(error, "Login failed.", "userError"),
  });
};

export const useLogout = () =>
  useMutation({
    mutationFn: logoutUser,
    onError: (error) => handleError(error, "Logout failed.", "userError"),
  });

export const useUsers = () =>
  useQuery({
    queryKey: ["users"],
    queryFn: async () => (await getUsers()).data.data,
  });

export const useUser = (id) =>
  useQuery({
    queryKey: ["users", id],
    queryFn: async () => (await getUserById(id)).data.data,
    enabled: !!id,
  });

export const useUpdateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateUser(id, data),
    onSuccess: (response, variables) => {
      // Invalidate and refetch users list
      qc.invalidateQueries({ queryKey: ["users"] });
      
      // Invalidate the specific user query that was edited
      qc.invalidateQueries({ queryKey: ["users", variables.id] });
      
      // Always invalidate and refetch the current user's profile to ensure permissions are up-to-date
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error) => handleError(error, "Failed to update user.", "userError"),
  });
};

export const useCreateUser = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: registerUser, 
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => handleError(error, "Failed to create user.", "userError"),
  });
};