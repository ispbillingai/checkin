
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:80',
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true
  }
}));
