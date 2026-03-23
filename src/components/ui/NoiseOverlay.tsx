/**
 * NoiseOverlay
 *
 * 카드 위에 얹는 노이즈 텍스처 오버레이 컴포넌트.
 * useImageFallback 훅으로 외부 URL 상태를 먼저 확인하고,
 * 실패하면 로컬 /noise.svg를 CSS 배경으로 사용합니다.
 *
 * 사용 예시 (ProductList.tsx):
 *   <NoiseOverlay />
 */

import { useImageFallback } from '../../hooks/useImageFallback';

const EXTERNAL_NOISE = 'https://grainy-gradients.vercel.app/noise.svg';
const LOCAL_NOISE = '/ai-electronic-device.png';

export function NoiseOverlay() {
  const { src } = useImageFallback(EXTERNAL_NOISE, LOCAL_NOISE);

  return (
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
      style={{ backgroundImage: `url('${src}')`, backgroundRepeat: 'repeat' }}
      aria-hidden="true"
    />
  );
}
