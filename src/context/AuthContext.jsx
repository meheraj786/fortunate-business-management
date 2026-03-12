/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useProfile, useLogin, useLogout } from "@/api/hooks/user";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const { data: user, isLoading: loading, isError } = useProfile();

  // If the profile query errored (e.g. 401 after refresh failure), treat as unauthenticated
  const resolvedUser = isError ? null : user;

  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  const login = async (email, password) => {
    const response = await loginMutation.mutateAsync({ email, password });
    localStorage.setItem("isAuthenticated", "true");
    await queryClient.invalidateQueries();
    return response;
  };

  const logout = async () => {
    localStorage.removeItem("isAuthenticated");
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
    if (resolvedUser?.access) {
      resolvedUser.access.forEach((module) => {
        module.permissions.forEach((permission) => {
          permissions.add(permission);
        });
      });
    }
    return permissions;
  }, [resolvedUser]);

  const hasPermission = (permissionToCheck) => {
    // ADMIN and SUPER_ADMIN have all permissions (matching backend authorize middleware)
    if (resolvedUser?.roleName === "SUPER_ADMIN" || resolvedUser?.roleName === "ADMIN") {
      return true;
    }
    return userPermissions.has(permissionToCheck);
  };

  const isSuperAdmin = resolvedUser?.roleName === "SUPER_ADMIN";
  const isAdmin = resolvedUser?.roleName === "ADMIN" || isSuperAdmin;

  const authInfo = {
    user: resolvedUser,
    loading,
    login,
    logout,
    isLoggingOut: logoutMutation.isPending,
    isSuperAdmin,
    isAdmin,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;

