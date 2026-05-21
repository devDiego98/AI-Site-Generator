import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig } from 'vite'

/** Builds ReactBits as an IIFE for the preview iframe (globals on window). */
export default defineConfig({
  publicDir: false,
  plugins: [
    react({
      // UMD React in the iframe only exposes createElement — not jsx/jsxs.
      jsxRuntime: 'classic',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env': JSON.stringify({ NODE_ENV: 'production' }),
  },
  build: {
    outDir: 'public',
    emptyOutDir: false,
    lib: {
      entry: path.resolve(__dirname, 'src/preview/reactBitsPreviewEntry.ts'),
      name: 'ReactBitsPreview',
      formats: ['iife'],
      fileName: () => 'react-bits-preview.iife.js',
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
        inlineDynamicImports: true,
        assetFileNames: 'react-bits-preview[extname]',
      },
    },
    minify: false,
    sourcemap: false,
  },
})
