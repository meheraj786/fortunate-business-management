import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSystemSettings, updateSystemSettings } from "../settings.api";
import toast from "react-hot-toast";

export const useSystemSettings = () => {
  return useQuery({
    queryKey: ["systemSettings"],
    queryFn: getSystemSettings,
    select: (data) => data.data,
    enabled: localStorage.getItem("isAuthenticated") === "true",
  });
};

export const useUpdateSystemSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSystemSettings,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["systemSettings"]);
      toast.success(data.message || "Settings updated successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update settings");
    },
  });
};
