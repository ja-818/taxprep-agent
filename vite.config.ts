import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: ".",
    lib: {
      entry: "src/index.ts",
      name: "__houston_bundle__",
      fileName: () => "bundle.js",
      formats: ["iife"],
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
      output: {
        globals: {
          react: "Houston.React",
          "react-dom": "Houston.ReactDOM",
          "react/jsx-runtime": "Houston.jsxRuntime",
        },
      },
    },
  },
});
