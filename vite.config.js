import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';
export default defineConfig({
    plugins: [react(), crx({ manifest: manifest })],
    resolve: {
        alias: {
            // Mirrors the tsconfig.json `paths` entry. Sprint 1 will populate
            // shared/types/ with the cross-package type contract; Sprint 0 ships
            // an empty stub so the alias just resolves cleanly.
            '@fitr/types': fileURLToPath(new URL('./shared/types/index.ts', import.meta.url)),
        },
    },
    server: {
        // Custom port unique to Fitr so it doesn't collide with other Vite
        // projects (which default to 5173). strictPort ensures @crxjs's HMR
        // for content scripts always uses the expected port.
        port: 5273,
        strictPort: true,
        hmr: {
            port: 5273,
        },
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
    },
});
