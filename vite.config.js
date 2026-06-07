// vite.config.js
// Конфигурация сборщика Vite для проекта Mesto
import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  base: './mesto-production', // Относительные пути для корректной работы на GitHub Pages
  server: {
    open: true,
    host: 'localhost',
    port: 5173,
  },
});
