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
        // desktop/mobile app shell (the marketing site lives in web/, on Next)
        app: path.resolve(__dirname, "index.html"),
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
