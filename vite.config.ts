
import { defineConfig } from "vite";
import path from "path";

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
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        booking: path.resolve(__dirname, 'src/pages/BookingForm.html'),
        notFound: path.resolve(__dirname, 'src/pages/NotFound.html'),
        error: path.resolve(__dirname, 'src/pages/error.html'),
      }
    }
  }
});
