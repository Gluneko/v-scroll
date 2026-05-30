import { defineConfig } from "vite";
import { resolve } from "node:path";
import createThemeCssExportPlugin from "./plugins/theme-css-export.js";

export default defineConfig({
  base: "./",
  plugins: [createThemeCssExportPlugin()],
  resolve: {
    alias: {
      "$/": `${resolve(process.cwd(), "public/theme")}/`
    }
  }
});
