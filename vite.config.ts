
import { defineConfig } from "vite";
import path from "path";

// Simple Vite config without React plugins
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
