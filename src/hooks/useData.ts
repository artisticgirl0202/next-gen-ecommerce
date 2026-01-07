// // src/hooks/useData.ts
// import { fetchProductsPage } from "@/api/products";
// import { fetchHybridRecommendations } from "@/api/recommend";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// export const useProducts = (page: number) => {
//   return useQuery({
//     queryKey: ["products", page],
//     queryFn: () => fetchProductsPage(page, 12),
//     staleTime: 1000 * 60 * 5,
//     cacheTime: 1000 * 60 * 30,
//   });
// };

// export function useRecommendations(productId: number | null, topN = 6) {
//   const qc = useQueryClient();
//   return useQuery(['recs', productId, topN], async () => {
//     if (!productId) return [];
//     const res = await fetchHybridRecommendations(productId, topN);
//     return res.recommendations ?? [];
//   }, {
//     enabled: !!productId,
//     staleTime: 1000 * 30,
//     cacheTime: 1000 * 60 * 10,
//     onSuccess: (items: any[]) => {
//       items.forEach((i) => { if (i?.image) { const img = new Image(); img.src = i.image; }});
//     }
//   });
// }

// // optimistic add to cart mutation (example)
// export const useAddToCart = (postCartItem: (item:any)=>Promise<any>) => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: postCartItem,
//     onMutate: async (newItem) => {
//       await queryClient.cancelQueries({ queryKey: ["cart"] });
//       const previousCart = queryClient.getQueryData(["cart"]);
//       queryClient.setQueryData(["cart"], (old: any) => [...(old||[]), newItem]);
//       return { previousCart };
//     },
//     onError: (err, newItem, context: any) => {
//       queryClient.setQueryData(["cart"], context?.previousCart);
//     },
//     onSettled: () => {
//       queryClient.invalidateQueries({ queryKey: ["cart"]});
//     }
//   });
// };


import { fetchProductsPage } from "@/api/products";
import { fetchHybridRecommendations } from "@/api/recommend";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * 1. 상품 목록 조회 (페이지네이션 + 검색어 캐싱 통합)
 */
export const useProducts = (page: number, searchQuery: string = "") => {
  return useQuery({
    // 검색어가 다르면 다른 캐시를 사용하도록 queryKey에 추가
    queryKey: ["products", page, searchQuery],
    queryFn: () => fetchProductsPage(page, 12, searchQuery),
    staleTime: 1000 * 60 * 5, // 5분간 신선도 유지
    gcTime: 1000 * 60 * 30,    // (v5 명칭: cacheTime -> gcTime) 30분간 캐시 보관
    // 검색 중일 때는 이전 데이터를 유지하여 화면 깜빡임 방지
    placeholderData: (previousData) => previousData,
  });
};

/**
 * 2. 하이브리드 추천 목록 조회
 */
export function useRecommendations(productId: number | null, topN = 6) {
  return useQuery({
    queryKey: ["recs", productId, topN],
    queryFn: async () => {
      if (!productId) return [];
      const res = await fetchHybridRecommendations(productId, topN);
      return res.recommendations ?? [];
    },
    enabled: !!productId, // productId가 있을 때만 실행
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 10,
    // v5에서는 onSuccess가 제거되었으므로, 필요한 경우 useEffect나 select에서 처리하지만
    // 이미지 프리로딩이 꼭 필요하다면 아래와 같이 로직을 유지할 수 있습니다.
    select: (items) => {
      if (typeof window !== "undefined") {
        items.forEach((i: any) => {
          if (i?.image) {
            const img = new Image();
            img.src = i.image;
          }
        });
      }
      return items;
    },
  });
}

/**
 * 3. 장바구니 추가 (Optimistic Update 적용)
 */
export const useAddToCart = (postCartItem: (item: any) => Promise<any>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postCartItem,
    // 서버 응답 전 화면에 먼저 반영 (낙관적 업데이트)
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previousCart = queryClient.getQueryData(["cart"]);

      queryClient.setQueryData(["cart"], (old: any) => [
        ...(old || []),
        newItem,
      ]);

      return { previousCart };
    },
    // 실패 시 이전 데이터로 롤백
    onError: (err, newItem, context: any) => {
      queryClient.setQueryData(["cart"], context?.previousCart);
      console.error("장바구니 추가 실패:", err);
    },
    // 성공/실패 여부와 상관없이 서버와 데이터 동기화
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};
