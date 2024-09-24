import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.join(__dirname, './src')
    },
    extensions: ['.js', '.ts', '.tsx', '.json']
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[local]-[hash:base64:5]'
    }
  },
  server: {
    proxy: {
      '/bingMap': {
        target: 'https://dev.virtualearth.net',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/bingMap/, ''),
        headers: {
          'Referer': 'https://openlayers.org/',
          'Origin': 'https://openlayers.org'
        }
      },
      '/waterConservancy': {
        target: 'http://slt.gxzf.gov.cn',
        rewrite: path => path.replace(/^\/waterConservancy/, ''),
        changeOrigin: true
      }
    }
  }
})
