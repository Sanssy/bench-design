import { defineConfig } from "vite";

export default defineConfig({
  build: {
    copyPublicDir: false,
    lib: { entry: "src/index.ts", formats: ["es"], fileName: () => "index.js" },
    emptyOutDir: true,
    rolldownOptions: {
      external: ["react", "react-dom", "react-aria-components"],
    },
  },
});
