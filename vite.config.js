import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
export default defineConfig({
<<<<<<< HEAD
plugins: [react()],
test: {
environment: 'jsdom',
globals: true,
setupFiles: './src/setupTests.js',
},
=======
  esbuild: {
    jsx: 'automatic',
  },
  plugins: [react()],
>>>>>>> fe76629022f0981e2455d6d26cdb2783499e0163
});
