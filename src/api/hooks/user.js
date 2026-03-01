import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  loginUser,
  logoutUser,
  getProfile,
  getUsers,
  getUserById,
  updateUser,
  registerUser
} from "@/api/user.api";
import { useApiMutation } from "@/hooks/useApiMutation";

export const useProfile = () =>
  useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      // Let the axios interceptor handle 401 transparently — it will
      // refresh the access token and retry this request automatically.
      // Do NOT catch 401 here; that would bypass the interceptor's retry
      // and cause the user to flash to the login page on every token refresh.
      const response = await getProfile();
      return response.data.data;
    },
    retry: (failureCount, error) => {
      // Don't retry on auth errors (the interceptor already tried refreshing)
      if (error.response?.status === 401) return false;
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes — no need to refetch profile constantly
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

export const useLogin = () => {
  const qc = useQueryClient();
  return useApiMutation({
    mutationFn: loginUser,
    onSuccess: (response) => {
      // Manually set the profile data from the login response
      qc.setQueryData(["profile"], response.data);
    },
    successMessage: "Logged in successfully!",
  });
};

export const useLogout = () =>
  useApiMutation({
    mutationFn: logoutUser,
    successMessage: "Logged out successfully!",
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
  return useApiMutation({
    mutationFn: ({ id, data }) => updateUser(id, data),
    onSuccess: (response, variables) => {
      // Invalidate and refetch users list
      qc.invalidateQueries({ queryKey: ["users"] });

      // Invalidate the specific user query that was edited
      qc.invalidateQueries({ queryKey: ["users", variables.id] });

      // Always invalidate and refetch the current user's profile to ensure permissions are up-to-date
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
    successMessage: "User updated successfully!",
  });
};

export const useCreateUser = () => {
  const qc = useQueryClient();

  return useApiMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
    },
    successMessage: "User created successfully!",
  });
};