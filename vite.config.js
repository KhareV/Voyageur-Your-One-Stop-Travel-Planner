import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Proxy API requests to the backend server
      "/api": {
        target: "http://localhost:5000", // Your backend server address
        changeOrigin: true, // Recommended for virtual hosted sites
        secure: false, // Set to true if your backend uses HTTPS
        // rewrite: (path) => path.replace(/^\/api/, ''), // Uncomment if backend doesn't expect /api prefix
      },
    },
  },
});
