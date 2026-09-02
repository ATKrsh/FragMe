import http from 'http';
import { spawn } from 'child_process';
import electron from 'electron';

const VITE_URL = 'http://localhost:5176';

function checkViteReady() {
  return new Promise((resolve) => {
    http
      .get(VITE_URL, (res) => {
        if (res.statusCode === 200) {
          resolve(true);
        } else {
          resolve(false);
        }
      })
      .on('error', () => {
        resolve(false);
      });
  });
}

async function start() {
  console.log('[Dev] Waiting for Vite Dev Server on port 5176...');
  let ready = false;
  while (!ready) {
    ready = await checkViteReady();
    if (!ready) {
      await new Promise((r) => setTimeout(r, 400));
    }
  }

  console.log('[Dev] Vite Dev Server is ready! Spawning Electron process...');
  const child = spawn(electron, ['.'], {
    stdio: 'inherit',
    env: { ...process.env, VITE_DEV_SERVER_URL: VITE_URL },
  });

  child.on('close', (code) => {
    process.exit(code ?? 0);
  });
}

start();
