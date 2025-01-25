import react from "@vitejs/plugin-react";
import { defineConfig as vitestDefineConfig } from "vitest/config";

export default vitestDefineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
  },
});
