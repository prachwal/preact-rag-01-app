import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [preact()],
  resolve: {
    alias: {
      'react': 'preact/compat',
      'react-dom/test-utils': 'preact/test-utils'
    }
  },
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment'
  },
  build: {
    rollupOptions: {
      output: {
        // Manual chunks for better caching
        manualChunks: {
          // Separate vendor chunks
          'preact-vendor': ['preact', 'preact/hooks'],
          'react-vendor': ['preact/compat'],
          // Split larger libraries into separate chunks
          'ui-vendor': []
        }
      }
    },
    // Optimization settings
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    } as any,
    // Chunk size warnings
    chunkSizeWarningLimit: 600
  },
  // Development server optimizations
  server: {
    fs: {
      strict: true
    }
  },
  // CSS optimization
  css: {
    devSourcemap: true
  }
})
