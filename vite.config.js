import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import compression from "vite-plugin-compression";
import { URL, fileURLToPath } from "node:url";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    compression({
      algorithm: "gzip",
      ext: ".gz",
    }),
    compression({
      algorithm: "brotliCompress",
      ext: ".br",
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router"],
          "ui-vendor": [
            "@headlessui/react",
            "lucide-react",
            "framer-motion",
            "react-icons",
            "react-hot-toast",
            "react-loading-skeleton",
            "react-select",
            "clsx",
            "flowbite",
          ],
          "utils-vendor": ["axios", "date-fns"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
