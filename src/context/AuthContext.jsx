import React, { createContext, useState, useEffect, useContext } from "react";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/services/apiService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  const updateUserData = (userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem("userData", JSON.stringify(userData));
      // Directly set query data instead of invalidating
      queryClient.setQueryData(["profile"], userData);
    } else {
      localStorage.removeItem("userData");
      queryClient.setQueryData(["profile"], null);
    }
  };

  // Initial load from localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("userData");

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        queryClient.setQueryData(["profile"], parsedUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("User parse error:", error);
      localStorage.removeItem("userData");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [queryClient]);

  // Listen to profile query updates from anywhere in the app
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      // Check if the profile query was updated
      if (event?.query?.queryKey?.[0] === "profile" && event.type === "updated") {
        const profileData = event.query.state.data;
        
        // Only update if data actually changed
        if (profileData && JSON.stringify(profileData) !== JSON.stringify(user)) {
          console.log("Profile updated from query cache:", profileData);
          setUser(profileData);
          localStorage.setItem("userData", JSON.stringify(profileData));
        }
      }
    });

    return () => unsubscribe();
  }, [queryClient, user]);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });

    const userData = res.data.data.user;
    const accessToken = res.data.data.token;

    updateUserData(userData);
    const cookieString = `accessToken=${accessToken}; path=/; SameSite=Lax`;
    document.cookie = cookieString;

    return userData;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.log("Logout error:", err);
    } finally {
      updateUserData(null);
      document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
  };

  const authInfo = {
    user,
    loading,
    login,
    logout,
    updateUserData,
  };

  return (
    <AuthContext.Provider value={authInfo}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthProvider;