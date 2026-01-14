// src/hooks/useEndToEndRecs.ts

import type { RecItem } from '@/api/integration';
import { fetchHybridRecsAPI, sendAIFeedbackAPI } from '@/api/integration';
import { useCallback, useEffect, useState } from 'react';

export function useEndToEndRecs(productId: number, userId: number | string) {
  const [recommendations, setRecommendations] = useState<RecItem[]>([]);
  const [loading, setLoading] = useState(false);
  // 1. 데이터 로드 함수
  const loadRecs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchHybridRecsAPI(productId);
      setRecommendations(data);
    } catch (err) {
      console.error('Failed to load recs', err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  // 초기 로드
  useEffect(() => {
    loadRecs();
  }, [loadRecs]);

  // 2. 사용자 액션 핸들러 (핵심 E2E 로직)
  // 액션 발생 -> 백엔드 전송(Kafka) -> (선택적) 추천 목록 갱신
  const handleUserAction = async (actionType: 'cart' | 'like' | 'view') => {
    // A. 낙관적 업데이트(Optimistic Update) 혹은 사용자 피드백 즉시 표시
    console.log(`[UI] User did: ${actionType}`);

    // B. 백엔드(Kafka)로 이벤트 전송
    await sendAIFeedbackAPI({
      userId,
      productId,
      action: actionType,
    });

    // C. 데이터 갱신 (Kafka Consumer가 DB를 업데이트했다고 가정하고 추천을 다시 받아옴)
    // *실시간성이 중요하다면 여기서 다시 fetch를 수행*
    console.log('[UI] Refreshing recommendations based on new context...');
    await loadRecs();
  };

  return {
    recommendations, // 여기에 .why 필드가 포함됨
    loading,
    refreshRecs: loadRecs,
    trackAction: handleUserAction,
  };
}
