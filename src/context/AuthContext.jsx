import React, { createContext, useState, useEffect, useContext } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const storedUser = localStorage.getItem("userData");

        if (!storedUser) {
          setUser(null);
          return;
        }

        const res = await api.get("/auth/profile");
        setUser(res.data.data);
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("userData");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });

    const userData = res.data.data.user;
    setUser(userData);
    localStorage.setItem("userData", JSON.stringify(userData));

    return userData;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.log("Logout error:", err);
    } finally {
      setUser(null);
      localStorage.removeItem("userData");
    }
  };

  const authInfo = {
    user,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={authInfo}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;