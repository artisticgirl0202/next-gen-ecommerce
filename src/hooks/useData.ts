// src/hooks/useData.ts
import { fetchProducts } from '@/api/products';
import { fetchHybridRecommendations } from '@/api/recommend';
import type { CartItem } from '@/store/cartStore';
import type { Product } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * 1. 상품 목록 조회 (페이지네이션 + 검색어 캐싱 통합)
 */
export const useProducts = (page: number, searchQuery = '') => {
  return useQuery<Product[]>({
    queryKey: ['products', page, searchQuery],
    queryFn: () => fetchProducts(page, 12),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (previousData) => previousData as Product[] | undefined,
  });

  // Note: fetchProducts maps API DTOs to our internal Product type to ensure required fields (e.g., brand) exist.
};

/**
 * 2. 하이브리드 추천 목록 조회
 */
export function useRecommendations(productId: number | null, topN = 6) {
  return useQuery<Product[]>({
    queryKey: ['recs', productId, topN],
    queryFn: async () => {
      if (!productId) return [];
      const res = await fetchHybridRecommendations(productId, topN);
      return res.recommendations ?? [];
    },
    enabled: !!productId,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 10,
    select: (items) => {
      if (typeof window !== 'undefined' && Array.isArray(items)) {
        (items as Product[]).forEach((i) => {
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
export const useAddToCart = (
  postCartItem: (item: CartItem) => Promise<CartItem>,
) => {
  const queryClient = useQueryClient();

  return useMutation<CartItem, unknown, CartItem>({
    mutationFn: postCartItem,
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData<CartItem[]>(['cart']);

      queryClient.setQueryData<CartItem[]>(['cart'], (old = []) => [
        ...old,
        newItem,
      ]);

      return { previousCart } as { previousCart?: CartItem[] };
    },
    onError: (err, _variables, _context) => {
      // Rollback if available; context typing is unknown per react-query signature
      // use getQueryData fallback to restore if needed
      const previous = queryClient.getQueryData<CartItem[]>(['cart']) ?? [];
      queryClient.setQueryData(['cart'], previous);
      console.error('장바구니 추가 실패:', err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};
