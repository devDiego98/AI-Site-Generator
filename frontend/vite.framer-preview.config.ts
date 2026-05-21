import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig } from 'vite'

/** Builds Framer Motion as an IIFE for the preview iframe (globals on window). */
export default defineConfig({
  publicDir: false,
  plugins: [
    react({
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
      entry: path.resolve(__dirname, 'src/preview/framerMotionPreviewEntry.ts'),
      name: 'FramerMotionPreview',
      formats: ['iife'],
      fileName: () => 'framer-motion-preview.iife.js',
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
        inlineDynamicImports: true,
      },
    },
    minify: false,
    sourcemap: false,
  },
})
