import { useState, useContext } from "react";
import { UrlContext } from "@/context/UrlContext";

const UrlProvider = ({ children }) => {
  const [baseUrl] = useState(import.meta.env.VITE_BASE_URL);

  return (
    <UrlContext.Provider value={{ baseUrl }}>{children}</UrlContext.Provider>
  );
};

export const useUrl = () => {
  return useContext(UrlContext);
};

export default UrlProvider;
