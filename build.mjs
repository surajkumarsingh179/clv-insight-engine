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
  });

  // Copy index.html to dist
  await fs.copyFile('index.html', `${outdir}/index.html`);

  console.log('✅ Build successful!');
} catch (e) {
  console.error('❌ Build failed:', e);
  process.exit(1);
}
