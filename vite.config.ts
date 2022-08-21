/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import pluginRewriteAll from 'vite-plugin-rewrite-all';

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    global: process.env.VITEST ? 'global' : 'globalThis',
  },
  plugins: [
    react(),
    // note(carlos): needed because Vite currently doesn't support
    // dots in path
    // https://github.com/vitejs/vite/pull/2634
    pluginRewriteAll(),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    deps: {
      inline: ['@rainbow-me/rainbowkit'],
    },
  },
});
