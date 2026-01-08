// export type Product = {
//   id: number;
//   name: string;
//   category: string;
//   price: number;
//   brand: string;
//   rating: number;
//   image: string;
//   images?: string[];
//   description?: string;
//   subCategory?: string;
//   specs?: Record<string,string>;
//   warranty?: string;
// };
// src/types.ts
export type Product = {
  id: number;
  name: string;
  brand: string;
  price: number;
  image: string;
  rating?: number;
  description?: string;
  // 일부 코드에서 단일 category 필드를 사용하기도 하므로 둘 다 허용
  category?: string;
  categories?: string[];
  connectivity?: string;
  specs?: Record<string, string>;
  // 간단한 리뷰 타입
  reviews?: Array<{ id: number; rating: number; title: string; body: string; date: string }>;
};
