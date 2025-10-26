import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // 🚨 Khi frontend gọi '/address-api/', Vite sẽ chuyển hướng request này đến API thật
      "/address-api": {
        target: "https://production.cas.so/address-kit",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/address-api/, ""), // Xóa '/address-api' khỏi URL gửi đi
      },
    },
  },
});
