import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import {quasar, transformAssetUrls} from '@quasar/vite-plugin'
import {fileURLToPath} from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {transformAssetUrls}
    }),
    quasar({
      sassVariables: fileURLToPath(
          new URL('./src/styles/base.scss', import.meta.url)
      )
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
})
