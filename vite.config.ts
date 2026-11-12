import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "VITE_");

  return {
    base: env.VITE_BASE_PATH || "/",
    define: {
      __USE_HASH_ROUTER__: JSON.stringify(Boolean(env.VITE_BASE_PATH)),
    },
    plugins: [react()],
  };
});
