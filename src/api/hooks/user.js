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
    queryFn: async () => {
      try {
        const response = await getProfile();
        return response.data;
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
      // Extract updated user data - adjust based on your API response structure
      const updatedUser = response?.data?.data || response?.data;
      
      console.log("Update response:", response);
      console.log("Updated user:", updatedUser);
      
      // Invalidate and refetch users list
      qc.invalidateQueries({ queryKey: ["users"] });
      
      // Invalidate the specific user query
      qc.invalidateQueries({ queryKey: ["users", variables.id] });
      
      // Get current profile from cache
      const currentProfile = qc.getQueryData(["profile"]);
      
      console.log("Current profile:", currentProfile);
      
      // If updating current logged-in user's profile, update profile cache
      if (currentProfile && updatedUser) {
        // Check if IDs match (handle both nested and direct id)
        const currentProfileId = currentProfile?.data?.id || currentProfile?.id;
        const updatedUserId = updatedUser?.id;
        
        if (currentProfileId === updatedUserId) {
          console.log("Updating profile cache for logged-in user");
          
          // Match the structure of currentProfile
          const updatedProfileData = currentProfile?.data 
            ? { ...currentProfile, data: { ...currentProfile.data, ...updatedUser } }
            : { ...currentProfile, ...updatedUser };
          
          qc.setQueryData(["profile"], updatedProfileData);
        }
      }
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