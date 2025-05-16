import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";     // keep the import

export default defineConfig(({ command }) => ({
  plugins: [
    react(),

    /*  PWA plugin:  disabled in dev, enabled in prod */
    VitePWA({
      /**
       * 'serve'  -> running  npm run dev
       * 'build'  -> running  npm run build / preview
       */
      registerType: command === "serve" ? "none" : "autoUpdate",

      /* Optional: keep your existing assets/manifest */
      includeAssets: ["logo.png"],
      manifest: {
        name: "Synguard Quote Tool",
        short_name: "Synguard",
        start_url: "/",
        display: "standalone",
        background_color: "#002C5F",
      },
    }),
  ],
}));
