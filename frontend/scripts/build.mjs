import * as esbuild from 'esbuild'
import { rimraf } from 'rimraf'
import stylePlugin from 'esbuild-style-plugin'
import autoprefixer from 'autoprefixer'
import tailwindcss from 'tailwindcss'
import { cp } from 'fs/promises'
import chokidar from 'chokidar'

const args = process.argv.slice(2)
const isProd = args[0] === '--production'

await rimraf('dist')

// Function to copy public assets
async function copyPublicAssets() {
  try {
    await cp('public', 'dist', { recursive: true })
    console.log('✅ Copied public assets to dist')
    
    // Rename the static landing page from index.html to home.html
    // This ensures the React app's index.html takes precedence
    const { rename } = await import('fs/promises')
    try {
      await rename('dist/index.html', 'dist/home.html')
      console.log('✅ Renamed static landing page to home.html')
      
      // Now rename our React app HTML to index.html
      await rename('dist/react-index.html', 'dist/index.html')
      console.log('✅ Set React app as main index.html')
    } catch (renameError) {
      console.log('⚠️  Error in HTML renaming:', renameError.message)
    }
  } catch (error) {
    console.log('⚠️  No public folder found, skipping copy')
  }
}

// Initial copy
await copyPublicAssets()

/**
 * @type {esbuild.BuildOptions}
 */
const esbuildOpts = {
  color: true,
  entryPoints: ['src/main.tsx', 'react-index.html'],
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
  
  // Watch public folder for changes with chokidar
  const watcher = chokidar.watch('public', {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true
  })
  
  let debounceTimer
  watcher.on('change', (path) => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(copyPublicAssets, 200)
  })
  
  watcher.on('add', (path) => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(copyPublicAssets, 200)
  })
  
  console.log('👀 Watching public folder for changes with chokidar...')
  
  const { hosts, port } = await ctx.serve({
    port: parseInt(process.env.PORT) || 8001,
    host: '127.0.0.1',
    servedir: 'dist'
  })
  console.log(`Running on:`)
  hosts.forEach((host) => {
    console.log(`http://${host}:${port}`)
  })
}
