import { defineConfig } from 'vite';
import { reactRouter } from '@react-router/dev/vite';
export default defineConfig({
  plugins: [reactRouter()],
  resolve: { dedupe: ['react', 'react-dom'] },
  optimizeDeps: { include: ['react', 'react-dom/client', 'react/jsx-runtime', 'zustand', 'gsap', 'gsap/ScrollTrigger', 'three', '@react-three/fiber', '@react-three/drei', 'maplibre-gl'] },
  server: { host: '0.0.0.0', port: 5173 },
});
