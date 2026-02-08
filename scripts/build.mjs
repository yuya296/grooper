import { build } from 'esbuild';
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash, generateKeyPairSync } from 'node:crypto';
import { join } from 'node:path';

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
    options: 'src/extension/options/options.tsx'
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

if (diagnosticsEnabled) {
  const manifestPath = join(distExt, 'manifest.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const { publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const publicKeyDer = publicKey.export({ type: 'spki', format: 'der' });
  const keyBase64 = Buffer.from(publicKeyDer).toString('base64');
  manifest.key = keyBase64;
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2));

  const hash = createHash('sha256').update(publicKeyDer).digest();
  const idBytes = hash.subarray(0, 16);
  const alphabet = 'abcdefghijklmnop';
  let extensionId = '';
  for (const byte of idBytes) {
    extensionId += alphabet[(byte >> 4) & 0xf];
    extensionId += alphabet[byte & 0xf];
  }
  await writeFile(join(distExt, 'extension-id.txt'), `${extensionId}\n`);
}
await cp('src/extension/popup/popup.html', join(distExt, 'popup.html'));
await cp('src/extension/options/options.html', join(distExt, 'options.html'));
await cp('src/extension/icons', join(distExt, 'icons'), { recursive: true });

const readme = `Build complete. Diagnostics: ${diagnosticsEnabled ? 'enabled' : 'disabled'}.\n`;
await writeFile(join(dist, 'BUILD_INFO.txt'), readme);
