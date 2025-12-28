import React, { createContext, useContext } from "react";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/services/apiService";
import { useProfile } from "@/api/hooks/user";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  
  // Always fetch fresh data from API
  const { data: profileData, isLoading: loading } = useProfile();
  
  // Extract user from profile response
  const user = profileData?.data || profileData || null;

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });

    const userData = res.data.data.user;
    const accessToken = res.data.data.token;

    // Set cookie for authentication
    const cookieString = `accessToken=${accessToken}; path=/; SameSite=Lax`;
    document.cookie = cookieString;
    
    // Update profile cache with fresh data
    queryClient.setQueryData(["profile"], userData);

    return userData;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.log("Logout error:", err);
    } finally {
      queryClient.setQueryData(["profile"], null);
      queryClient.clear();
      
      document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
  };

  const isSuperAdmin= user?.roleName === "SUPER_ADMIN";

  const authInfo = {
    user,
    loading,
    login,
    logout,
    isSuperAdmin
  };

  return (
    <AuthContext.Provider value={authInfo}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthProvider;