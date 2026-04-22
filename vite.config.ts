import { defineConfig, type Plugin } from 'vite'
import { resolve } from 'path'
import fs from 'fs'

function flattenHTMLPlugin(): Plugin {
  return {
    name: 'flatten-html',
    closeBundle() {
      const dist = resolve(__dirname, 'dist')
      // Move any HTML files from subdirs to dist root
      const walk = (dir: string) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          const full = resolve(dir, entry.name)
          if (entry.isDirectory() && entry.name !== 'icons') {
            walk(full)
          } else if (entry.name.endsWith('.html')) {
            const dest = resolve(dist, entry.name)
            if (full !== dest) {
              let content = fs.readFileSync(full, 'utf8')
              // Fix relative paths: strip ../../ prefixes caused by subdir output
              content = content.replace(/(?:\.\.\/)+/g, './').replace(/\.\/\.\//g, './')
              fs.writeFileSync(dest, content)
              fs.unlinkSync(full)
            }
          }
        }
      }
      walk(dist)
      // Clean up empty src dir
      const srcDir = resolve(dist, 'src')
      if (fs.existsSync(srcDir)) {
        fs.rmSync(srcDir, { recursive: true })
      }
    },
  }
}

export default defineConfig({
  base: './',
  plugins: [flattenHTMLPlugin()],
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/popup.html'),
        'service-worker': resolve(__dirname, 'src/background/service-worker.ts'),
        content: resolve(__dirname, 'src/content/content.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
    copyPublicDir: true,
  },
})
