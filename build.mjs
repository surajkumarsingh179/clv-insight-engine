import esbuild from 'esbuild';
import fs from 'fs/promises';

const outdir = 'dist';

try {
  // Ensure dist directory is clean
  await fs.rm(outdir, { recursive: true, force: true });
  await fs.mkdir(outdir, { recursive: true });

  // Build the TSX file
  await esbuild.build({
    entryPoints: ['index.tsx'],
    bundle: true,
    outfile: `${outdir}/index.js`,
    jsx: 'automatic',
    minify: true,
    sourcemap: true,
    // FIX: Exclude CDN-loaded packages from the bundle to resolve runtime conflict.
    external: ['react', 'react-dom/*', 'recharts', '@google/genai'],
  });

  // Copy index.html to dist
  await fs.copyFile('index.html', `${outdir}/index.html`);

  console.log('✅ Build successful!');
} catch (e) {
  console.error('❌ Build failed:', e);
  // Explicitly exit with a failure code to stop the build process.
  // FIX: The explicit import for `process` was removed to rely on the global Node.js object, resolving the type error.
  process.exit(1);
}

