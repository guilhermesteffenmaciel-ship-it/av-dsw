import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Tailwind CSS 4.3 integrado ao Vite pelo plugin oficial @tailwindcss/vite (mesma versão: 4.3.0)
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
