import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from "fs";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    {
      name: 'copy-pdfjs-worker',
      buildStart() {
        const src = path.resolve(__dirname, 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs');
        const dest = path.resolve(__dirname, 'public/pdf.worker.min.mjs');
        if (fs.existsSync(src) && !fs.existsSync(dest)) {
          fs.copyFileSync(src, dest);
        } else if (fs.existsSync(src)) {
          fs.copyFileSync(src, dest);
        }
      },
    },
  ].filter(Boolean),
  optimizeDeps: {
    exclude: ['pdfjs-dist'],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"],
  },
}));
