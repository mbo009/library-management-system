import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { defineConfig as vitestDefineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
