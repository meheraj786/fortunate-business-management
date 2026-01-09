import { useQuery } from "@tanstack/react-query";
import { getPermissions } from "../permissions.api";

export const usePermissions = () =>
  useQuery({
    queryKey: ["permissions"],
    queryFn: async () => (await getPermissions()).data,
  });