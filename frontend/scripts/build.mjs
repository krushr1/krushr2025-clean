import * as esbuild from 'esbuild'
import { rimraf } from 'rimraf'
import stylePlugin from 'esbuild-style-plugin'
import autoprefixer from 'autoprefixer'
import tailwindcss from 'tailwindcss'
import { cp, stat, copyFile, mkdir } from 'fs/promises'
import { dirname, relative } from 'path'
import chokidar from 'chokidar'

const args = process.argv.slice(2)
const isProd = args[0] === '--production'

// Set NODE_ENV environment variable
process.env.NODE_ENV = isProd ? 'production' : 'development'

await rimraf('dist')

const fileStats = new Map()

async function smartCopyFile(src, dest) {
  try {
    const srcStat = await stat(src)
    const srcTime = srcStat.mtime.getTime()
    
    let shouldCopy = true
    try {
      const destStat = await stat(dest)
      const destTime = destStat.mtime.getTime()
      const lastKnownTime = fileStats.get(src) || 0
      
      shouldCopy = srcTime > destTime || srcTime > lastKnownTime
    } catch {
      shouldCopy = true
    }
    
    if (shouldCopy) {
      await mkdir(dirname(dest), { recursive: true })
      await copyFile(src, dest)
      fileStats.set(src, srcTime)
      console.log(`Copied: ${relative('.', src)} → ${relative('.', dest)}`)
      return true
    }
    return false
  } catch (error) {
    console.error(`Failed to copy ${src}:`, error.message)
    return false
  }
}

async function copyPublicAssets(changedFile = null) {
  try {
    if (changedFile) {
      const relativePath = relative('public', changedFile)
      const destPath = `public/${relativePath}`
      await smartCopyFile(changedFile, destPath)
    } else {
      await cp('public', 'public', { 
        recursive: true,
        filter: async (src, dest) => {
          if (src.endsWith('.html') || src.endsWith('.css') || src.endsWith('.js')) {
            return await smartCopyFile(src, dest)
          } else {
            return true
          }
        }
      })
      console.log('Public assets copied')
    }
    
    if (!changedFile) {
      const { copyFile } = await import('fs/promises')
      try {
        // Copy react app as main index
        await copyFile('index.html', 'public/index.html')
        console.log('React app set as main index.html')
      } catch (copyError) {
        console.log('React index copy failed:', copyError.message)
      }
    }
  } catch (error) {
    console.log('Copy failed:', error.message)
  }
}

// Initial copy
await copyPublicAssets()

/**
 * @type {esbuild.BuildOptions}
 */
const esbuildOpts = {
  color: true,
  entryPoints: ['src/main.tsx', 'index.html'],
  assetNames: '[name]',
  publicPath: '/',
  outdir: 'dist',
  entryNames: '[name]',
  write: true,
  bundle: true,
  format: 'esm',
  sourcemap: isProd ? false : 'linked',
  minify: isProd,
  treeShaking: true,
  splitting: true,
  chunkNames: 'chunks/[name]-[hash]',
  jsx: 'automatic',
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  },
  loader: {
    '.html': 'copy',
    '.png': 'file',
    '.svg': 'copy',
    '.ico': 'file',
    '.json': 'copy',
  },
  plugins: [
    stylePlugin({
      postcss: {
        plugins: [tailwindcss, autoprefixer],
      },
    }),
  ],
}

if (isProd) {
  await esbuild.build(esbuildOpts)
} else {
  const ctx = await esbuild.context(esbuildOpts)
  await ctx.watch()
  
  // Watch public directory for changes and copy immediately
  const publicWatcher = chokidar.watch('public/**/*', {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true
  })
  
  publicWatcher.on('change', async (path) => {
    console.log(`Public file changed: ${path}`)
    await copyPublicAssets(path)
  })
  
  const { hosts, port } = await ctx.serve({
    port: parseInt(process.env.PORT) || 8001,
    host: '127.0.0.1',
    servedir: 'dist'
  })
  console.log(`Running on:`)
  hosts.forEach((host) => {
    console.log(`http://${host}:${port}`)
  })
  console.log('Watching public/ directory for changes...')
}
