import fs from 'fs';
import path from 'path';

const releaseDir = path.resolve('release');
const srcDir = path.join(releaseDir, 'win-unpacked');
const destDir = path.join(releaseDir, 'FragMe_v4_Package');

console.log('[MultiFolder Packager] Syncing unpacked distribution to FragMe_v4_Package...');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

if (fs.existsSync(srcDir)) {
  if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true, force: true });
  }
  copyRecursiveSync(srcDir, destDir);
  console.log(`[MultiFolder Packager] Successfully created standalone package: ${destDir}`);
} else {
  console.error(`[MultiFolder Packager] Source directory not found: ${srcDir}`);
}
