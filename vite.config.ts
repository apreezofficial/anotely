import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  clearScreen: false,
  build: {
    rollupOptions: {
      input: {
        // desktop/mobile app shell
        app: path.resolve(__dirname, "index.html"),
        // marketing site
        site: path.resolve(__dirname, "site.html"),
      },
    },
  },
  server: {
    port: host ? 1421 : 5173,
    strictPort: true,
    host: host || false,
    hmr: host ? { protocol: "ws", host, port: 1422 } : undefined,
    watch: { ignored: ["**/src-tauri/**"] },
  },
});
