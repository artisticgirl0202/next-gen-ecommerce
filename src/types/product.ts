export type Product = {
  id: number;
  name: string;
  title?: string; // 호환성을 위해 추가
  brand?: string; // 브랜드 필드 추가
  price: number;
  image: string;
  rating?: number;
  description?: string;
  category?: string;
  categories?: string[];
  connectivity?: string;
  specs?: Record<string, string>;
  why?: string;
  why_en?: string;
  reviews?: Array<{
    id: number;
    rating: number;
    title: string;
    body: string;
    date: string;
  }>;
};
