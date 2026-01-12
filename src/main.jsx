import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "@/App.jsx";
import UrlProvider from "@/context/UrlProvider.jsx";
import { AuthProvider } from "@/context/AuthContext.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <UrlProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </UrlProvider>
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);
