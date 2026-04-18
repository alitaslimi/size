import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// `base` is set at build time via VITE_BASE (or --base). The default "/" is
// right for local dev and custom domains. GitHub Pages project pages need
// the repo path (e.g. "/size/"), which the deploy workflow supplies.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE ?? "/",
});
