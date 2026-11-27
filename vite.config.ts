import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      // Ensure Vite never publishes any private aistudio chat attachment directory into dist/
      {
        name: 'exclude-aistudio-from-dist',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(__dirname, 'dist');
          const removeNestedAistudioDirs = (dir: string): void => {
            if (!fs.existsSync(dir)) return;
            for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
              if (!entry.isDirectory()) continue;
              const fullPath = path.join(dir, entry.name);
              if (entry.name.toLowerCase() === 'aistudio') {
                fs.rmSync(fullPath, {recursive: true, force: true});
              } else {
                removeNestedAistudioDirs(fullPath);
              }
            }
          };
          removeNestedAistudioDirs(distDir);
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
