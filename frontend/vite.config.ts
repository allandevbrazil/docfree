import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Forward API and Swagger requests to the backend during development
      "/api": {
        target: "http://localhost:3333",
        changeOrigin: true,
      },
      "/api-docs": {
        target: "http://localhost:3333",
        changeOrigin: true,
      },
      "/health": {
        target: "http://localhost:3333",
        changeOrigin: true,
      },
    },
  },
});