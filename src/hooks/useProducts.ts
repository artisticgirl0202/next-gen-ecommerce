import { fetchProducts } from "@/api/products";
// note: no real API for postCartItem in this demo; use local stub for optimistic update.
import type { CartItem } from "@/store/cartStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useProducts = (page: number, searchQuery: string = "") => {
  return useQuery({
    // queryKey에 종속성을 명확히 하여 불필요한 재호출 방지
    queryKey: ["products", { page, searchQuery }],
    queryFn: () => fetchProducts(page, 12),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    // 데이터가 로딩 중일 때 UI가 굳지 않도록 이전 데이터 유지
    placeholderData: (previousData) => previousData,
    // 500개 데이터를 다룰 때 네트워크 에러가 브라우저를 멈추지 않게 방어
    retry: 1,
  });
};

// Optimistic Update 적용 (장바구니 추가)
export const useAddToCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (item: CartItem) => item, // stub: resolve immediately (demo)
    onMutate: async (newItem: CartItem) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previousCart = queryClient.getQueryData<CartItem[]>(["cart"]);
      queryClient.setQueryData<CartItem[]>(["cart"], (old = []) => [...old, newItem]);
      return { previousCart } as { previousCart?: CartItem[] };
    },
    onError: (_err, _newItem, context?: { previousCart?: CartItem[] }) => {
      queryClient.setQueryData(["cart"], context?.previousCart ?? []);
    },
  });
};
