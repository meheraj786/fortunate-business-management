import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "@/App.jsx";
import UrlProvider from "@/context/UrlProvider.jsx";
import { AuthProvider } from "@/context/AuthContext.jsx";

createRoot(document.getElementById("root")).render(
  
    <UrlProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </UrlProvider>
  
);