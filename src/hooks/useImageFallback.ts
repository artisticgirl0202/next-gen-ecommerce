/**
 * useImageFallback
 *
 * 외부 이미지 URL의 접근 가능 여부를 적극적으로(proactively) 확인하는 React 훅.
 * onerror 방식과 달리, 컴포넌트 마운트 시점에 fetch로 미리 URL을 검사하여
 * 로드 실패 여부를 확정한 뒤 올바른 src를 상태로 제공합니다.
 *
 * 특징:
 * - fetch HEAD 요청으로 실제 이미지 다운로드 없이 상태 확인 (최소 트래픽)
 * - 403, 404, 네트워크 오류 모두 감지
 * - 결과를 sessionStorage에 캐시하여 페이지 내 중복 요청 방지
 * - Next.js App Router / Pages Router 모두 호환 (useEffect 기반)
 *
 * 사용 예시:
 *   const { src, isLoading, hasFallback } = useImageFallback(
 *     'https://grainy-gradients.vercel.app/noise.svg',
 *     '/noise.svg'
 *   );
 *   // src → 접근 가능한 URL이 자동으로 선택됨
 *   // hasFallback → true면 외부 URL이 실패해서 로컬을 사용 중
 */

import { useState, useEffect } from 'react';

interface UseImageFallbackResult {
  /** 현재 사용해야 할 이미지 src */
  src: string;
  /** 외부 URL 검사가 완료되기 전 true */
  isLoading: boolean;
  /** 외부 URL 로드에 실패하여 로컬 fallback을 사용 중이면 true */
  hasFallback: boolean;
}

const CACHE_PREFIX = 'img_fallback_v1:';

function getCached(url: string): boolean | null {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + url);
    if (raw === null) return null;
    return raw === 'ok';
  } catch {
    return null;
  }
}

function setCached(url: string, ok: boolean): void {
  try {
    sessionStorage.setItem(CACHE_PREFIX + url, ok ? 'ok' : 'fail');
  } catch {
    // sessionStorage 사용 불가 환경(SSR 등)에서 안전하게 무시
  }
}

export function useImageFallback(
  primarySrc: string,
  fallbackSrc: string
): UseImageFallbackResult {
  const cached = getCached(primarySrc);

  const [isLoading, setIsLoading] = useState(cached === null);
  const [hasFallback, setHasFallback] = useState(cached === false);

  useEffect(() => {
    // 이미 캐시된 결과가 있으면 fetch를 건너뜀
    if (cached !== null) {
      setIsLoading(false);
      setHasFallback(cached === false);
      return;
    }

    let cancelled = false;

    const checkUrl = async () => {
      try {
        // HEAD 요청: 실제 이미지 본문을 받지 않고 상태 코드만 확인 (빠르고 저렴)
        const res = await fetch(primarySrc, {
          method: 'HEAD',
          // 브라우저 캐시 우선 사용, 없으면 네트워크 요청
          cache: 'force-cache',
        });

        if (cancelled) return;

        const ok = res.ok; // 200~299: 성공
        setCached(primarySrc, ok);
        setHasFallback(!ok);
      } catch {
        // 네트워크 오류, CORS 차단 등
        if (!cancelled) {
          setCached(primarySrc, false);
          setHasFallback(true);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    checkUrl();

    return () => {
      cancelled = true;
    };
  }, [primarySrc, cached]);

  return {
    src: hasFallback ? fallbackSrc : primarySrc,
    isLoading,
    hasFallback,
  };
}
