import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    nodePolyfills({
      // Whether to polyfill specific globals.
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      stream: 'stream-browserify',
    },
  },
  define: {
    'process.env': {},
  },
  optimizeDeps: {
    include: [
      'buffer',
      'process',
      'stream-browserify',
      'readable-stream',
      '@solana/web3.js',
      '@metaplex-foundation/js'
    ],
    exclude: ['@mysten/walrus-wasm'],
  },
  build: {
    rollupOptions: {
      external: ['@mysten/walrus-wasm'],
    },
  },
}));
