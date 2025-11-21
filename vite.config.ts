import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // This plugin bundles everything into one HTML file
    viteSingleFile()
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'esnext',
    assetsInlineLimit: 100000000, // Ensure assets are inlined
    chunkSizeWarningLimit: 100000000,
    cssCodeSplit: false, // Put CSS in the HTML
    brotliSize: false,
    rollupOptions: {
      inlineDynamicImports: true,
      output: {
        manualChunks: undefined,
      },
    }
  }
});