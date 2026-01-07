import { postCartItem } from "@/api/cart"; // 실제 API 함수 임포트 확인
import { fetchProductsPage } from "@/api/products";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useProducts = (page: number, searchQuery: string = "") => {
  return useQuery({
    // queryKey에 종속성을 명확히 하여 불필요한 재호출 방지
    queryKey: ["products", { page, searchQuery }],
    queryFn: () => fetchProductsPage(page, 12, searchQuery),
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
    mutationFn: postCartItem,
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previousCart = queryClient.getQueryData(["cart"]);
      queryClient.setQueryData(["cart"], (old: any) => [...old, newItem]);
      return { previousCart };
    },
    onError: (err, newItem, context) => {
      queryClient.setQueryData(["cart"], context?.previousCart);
    },
  });
};
