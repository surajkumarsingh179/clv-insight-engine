import esbuild from 'esbuild';
import fs from 'fs/promises';

// FIX: Import `process` from 'node:process' to provide correct type definitions
// and resolve the "Property 'exit' does not exist on type 'Process'" error.
import process from 'node:process';

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
  });

  // Copy index.html to dist
  await fs.copyFile('index.html', `${outdir}/index.html`);

  console.log('✅ Build successful!');
} catch (e) {
  console.error('❌ Build failed:', e);
  // Explicitly exit with a failure code to stop the build process.
  process.exit(1);
}
