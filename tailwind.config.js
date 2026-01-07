/* @type {import('tailwindcss').Config} */
// @import "tailwindcss";
// @config "../tailwind.config.js"; /* 설정 파일이 있는 경우 */
// export default {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,ts,jsx,tsx}",
//   ],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// }
/** @type {import('tailwindcss').Config} */
export default {
  // 1. 파일 경로 설정 유지 및 최적화
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}", // Next.js App Router 사용 시 대비
    "./components/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      // 2. 시스템 인터페이스 전용 컬러 확장 (선택사항)
      colors: {
        slate: {
          950: '#020617',
        },
        cyan: {
          500: '#06b6d4',
        }
      },

      // 3. 애니메이션 핵심 로직 (병합 및 업그레이드)
      keyframes: {
        // 방금 추가한 스캔라인 효과
        'scan-line': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '10%': { opacity: '0.5' },
          '90%': { opacity: '0.5' },
          '100%': { transform: 'translateY(100%)', opacity: '0' },
        },
        // 시스템 상태등을 위한 부드러운 깜빡임
        'pulse-soft': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(0.95)' },
        },
        // 테두리 빛 흐름 효과 (선택사항)
        'border-flow': {
          '0%': { 'border-color': 'rgba(6, 182, 212, 0.1)' },
          '50%': { 'border-color': 'rgba(6, 182, 212, 0.5)' },
          '100%': { 'border-color': 'rgba(6, 182, 212, 0.1)' },
        }
      },

      animation: {
        // 2초 주기로 무한 반복되는 스캔라인
        'scan-line': 'scan-line 3s linear infinite',
        // 더 느리고 부드러운 펄스 효과
        'pulse-slow': 'pulse-soft 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        // 테두리 강조 애니메이션
        'border-glow': 'border-flow 2s ease-in-out infinite',
      },

      // 4. 반응형 디자인을 위한 커스텀 스크린 (필요 시)
      screens: {
        'xs': '475px',
        '2xl': '1536px',
        '3xl': '1920px', // 울트라 와이드 대응
      },
    },
  },

  plugins: [
    // 스크롤바 숨기기 유틸리티 (ProductList에서 사용됨)
    function ({ addUtilities }) {
      addUtilities({
        '.no-scrollbar': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      })
    },
  ],
}
