import fs from 'fs';
import path from 'path';

const src = path.resolve('electron/preload.cjs');
const destDir = path.resolve('dist-electron');
const dest = path.join(destDir, 'preload.cjs');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

if (fs.existsSync(src)) {
  fs.copyFileSync(src, dest);
  console.log('[Build] Copied electron/preload.cjs -> dist-electron/preload.cjs');
} else {
  console.warn('[Build] Warning: electron/preload.cjs not found to copy');
}

const scriptsSrc = path.resolve('electron/scripts');
const scriptsDest = path.join(destDir, 'scripts');
if (fs.existsSync(scriptsSrc)) {
  if (!fs.existsSync(scriptsDest)) {
    fs.mkdirSync(scriptsDest, { recursive: true });
  }
  const files = fs.readdirSync(scriptsSrc);
  for (const f of files) {
    fs.copyFileSync(path.join(scriptsSrc, f), path.join(scriptsDest, f));
  }
  console.log('[Build] Copied electron/scripts -> dist-electron/scripts');
}
