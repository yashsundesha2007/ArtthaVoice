import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Use relative base path so assets load properly on GitHub Pages (https://<user>.github.io/<repo>/)
  base: './',
  server: {
    port: 3000,
    open: false,
    host: true,
  }
});
