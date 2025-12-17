import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "@/App.jsx";
import UrlProvider from "@/context/UrlProvider.jsx";
import { AuthProvider } from "@/context/AuthContext.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";



const queryClient = new QueryClient()

createRoot(document.getElementById("root")).render(
  
    <UrlProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools initialIsOpen={false} />
        <App />
        </QueryClientProvider>
      </AuthProvider>
    </UrlProvider>
  
);