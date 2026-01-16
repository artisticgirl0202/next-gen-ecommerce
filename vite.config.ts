import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite'; // 1. loadEnv 추가

// 2. defineConfig 내부를 함수형으로 변경 ({ mode }) => { ... }
export default defineConfig(({ mode }) => {
  // 3. 현재 모드(development/production)에 맞는 .env 파일을 불러옴
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: '/',
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      proxy: {
        '/api': {
          // 4. 불러온 env 변수를 사용하거나, 없으면 기본값(localhost) 사용
          target: env.VITE_API_BASE_URL || 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        },
      },
      hmr: { overlay: false },
      watch: {
        ignored: [
          '**/node_modules/**',
          '**/dist/**',
          '**/.git/**',
          '**/venv/**',
          '**/backend/venv/**',
        ],
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom'],
      esbuildOptions: {
        loader: { '.js': 'jsx', '.cjs': 'jsx' },
      },
    },
    build: {
      sourcemap: true,
    },
  };
});
