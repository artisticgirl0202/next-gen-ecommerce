// import react from '@vitejs/plugin-react'
// import path from 'path'
// import { defineConfig } from 'vite'

// export default defineConfig({
//  [vite] hot updated: /src/index.css가 멈추지 않는 것은 대개 CSS 파일이 런타임 중에 계속 생성되거나 수정되어 Vite가 이를 새로운 변경사항으로 오해하기 때문입니다.원인: Tailwind CSS v4 혹은 특정 PostCSS 플러그인이 index.css를 실시간으로 다시 쓰면서(Rewrite), Vite는 파일이 변했다고 판단해 브라우저를 계속 새로고침하는 '무한 루프'가 발생한 것입니다. 해결책: vite.config.ts에서 서버 옵션을 조정하여 불필요한 감시를 차단해야 합니다.plugins: [react()],
//   resolve: {
//     alias: {
//       '@': path.resolve(__dirname, 'src'),
//     },
//   },
// })
// import react from '@vitejs/plugin-react';
// import { defineConfig } from 'vite';

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     watch: {
//       // node_modules나 자동 생성되는 임시 파일을 감시 대상에서 제외
//       ignored: ['**/node_modules/**', '**/dist/**'],
//     },
//     hmr: {
//       // HMR 연결이 불안정할 경우 오버레이를 끄거나 포트를 고정
//       overlay: true,
//     },
//   },
// });
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,

      }
    },
    // CSS 관련 HMR(Hot Module Replacement) 이슈 해결을 위해 추가
    hmr: {
      overlay: false, // 브라우저에 뜨는 에러 오버레이가 루프를 유발할 수 있음
    },
    watch: {
      // 빌드 결과물과 스타일 캐시를 감시 대상에서 명시적으로 제외
      ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
    },
  },
});
