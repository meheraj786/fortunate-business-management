import React, { createContext, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useProfile, useLogin, useLogout } from "@/api/hooks/user";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const { data: user, isLoading: loading } = useProfile();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  const login = async (email, password) => {
    const response = await loginMutation.mutateAsync({ email, password });
    await queryClient.invalidateQueries();
    return response;
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (err) {
      console.log("Logout error:", err);
    } finally {
      queryClient.setQueryData(["profile"], null);
      queryClient.clear();
    }
  };

  const userPermissions = useMemo(() => {
    const permissions = new Set();
    if (user?.access) {
      user.access.forEach((module) => {
        module.permissions.forEach((permission) => {
          permissions.add(permission);
        });
      });
    }
    return permissions;
  }, [user]);

  const hasPermission = (permissionToCheck) => {
    return userPermissions.has(permissionToCheck);
  };

  const isSuperAdmin = user?.roleName === "SUPER_ADMIN";

  const authInfo = {
    user,
    loading,
    login,
    logout,
    isLoggingOut: logoutMutation.isPending,
    isSuperAdmin,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;