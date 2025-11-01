import { useState } from "react";
import { UrlContext } from "./UrlContext";

const UrlProvider = ({ children }) => {
  const [baseUrl] = useState(import.meta.env.VITE_BASE_URL);

  return (
    <UrlContext.Provider value={{ baseUrl }}>{children}</UrlContext.Provider>
  );
};

export default UrlProvider;
