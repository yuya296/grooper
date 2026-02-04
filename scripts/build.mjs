import { build } from 'esbuild';
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const root = process.cwd();
const dist = join(root, 'dist');
const distExt = join(dist, 'extension');
const distCli = join(dist, 'cli');

await mkdir(distExt, { recursive: true });
await mkdir(distCli, { recursive: true });

const diagnosticsEnabled = process.env.DIAGNOSTICS === '1';

await build({
  entryPoints: {
    background: 'src/extension/background.ts',
    popup: 'src/extension/popup/popup.ts',
    options: 'src/extension/options/options.ts'
  },
  bundle: true,
  format: 'iife',
  platform: 'browser',
  outdir: distExt,
  sourcemap: true,
  define: {
    __DIAGNOSTICS__: JSON.stringify(diagnosticsEnabled)
  }
});

await build({
  entryPoints: {
    index: 'src/cli/index.ts'
  },
  bundle: true,
  format: 'esm',
  platform: 'node',
  outdir: distCli,
  sourcemap: true
});

await cp('src/extension/manifest.json', join(distExt, 'manifest.json'));
await cp('src/extension/popup/popup.html', join(distExt, 'popup.html'));
await cp('src/extension/options/options.html', join(distExt, 'options.html'));

const readme = `Build complete. Diagnostics: ${diagnosticsEnabled ? 'enabled' : 'disabled'}.\n`;
await writeFile(join(dist, 'BUILD_INFO.txt'), readme);
