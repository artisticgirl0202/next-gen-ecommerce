/**
 * ImageWithFallback
 *
 * <img> 태그의 onerror 이벤트를 활용한 이미지 풀백 컴포넌트.
 * 외부 URL 로드 실패(403, 404, 네트워크 오류 등) 시 로컬 이미지로 즉시 전환합니다.
 *
 * 사용 예시:
 *   <ImageWithFallback
 *     src="https://grainy-gradients.vercel.app/noise.svg"
 *     fallbackSrc="/noise.svg"
 *     alt="노이즈 텍스처"
 *   />
 */

import { useState, useCallback } from 'react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallbackSrc: string;
  alt: string;
}

export function ImageWithFallback({
  src,
  fallbackSrc,
  alt,
  onError,
  ...props
}: ImageWithFallbackProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasFailed, setHasFailed] = useState(false);

  const handleError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      // 무한 루프 방지: fallback도 실패하면 더 이상 교체하지 않음
      if (!hasFailed) {
        setHasFailed(true);
        setCurrentSrc(fallbackSrc);
      }
      // 외부에서 전달된 onError 핸들러도 실행
      onError?.(e);
    },
    [hasFailed, fallbackSrc, onError]
  );

  return (
    <img
      {...props}
      src={currentSrc}
      alt={alt}
      onError={handleError}
    />
  );
}
