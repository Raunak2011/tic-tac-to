import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative asset paths so the build works when opened from any folder
  // (e.g. /dist/ through a static server) or hosted under a subpath.
  base: './',
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
});
