
import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  base: '/mesto-production',
  server: {
    open: true,
    host: 'localhost',
    port: 5173,
  },
});
