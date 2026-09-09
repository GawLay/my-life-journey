import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  // Relative base so the built site works from any static host / subfolder.
  base: './',
  server: {
    host: true,
    port: 5173,
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        work: resolve(import.meta.dirname, 'index.html'),
        world: resolve(import.meta.dirname, 'world.html'),
        discovery: resolve(import.meta.dirname, 'discovery.html'),
        country: resolve(import.meta.dirname, 'country.html'),
        project: resolve(import.meta.dirname, 'project.html'),
      },
    },
  },
});
