// src/data/combined_fast.ts
import type { Product } from '@/types';

// ✅ 1. 기본 상품 데이터
const CATEGORY_PRODUCTS = [
  {
    id: 1,
    category: 'Computing Devices',
    name: 'Quantum Blade Laptop',
    brand: 'NextGen',
    price: 2499,
    image:
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
    description:
      'Next-generation liquid-cooled laptop with AI-optimized neural cores.',
  },
  // ... (기타 상품 데이터가 있다면 이곳에 추가)
];

// ✅ 2. 카테고리 정의
export const TARGET_CATEGORIES = [
  'All',
  'Computing Devices',
  'Mobile & Wearables',
  'Audio Devices',
  'Video & Display',
  'Cameras & Imaging',
  'Peripherals',
  'Gaming Gear',
  'Smart Home & IoT',
  'Network & Comm',
  'Power & Charging',
  'Components',
  'AI & Next-Gen',
];

// ✅ 3. 카테고리 자동 매핑 함수
// [수정 완료] productName을 사용하지 않으므로 _productName으로 변경하여 TS6133 에러 방지
const mapCategory = (rawCategory: string, _productName: string): string => {
  if (rawCategory === 'Special Purpose') return 'AI & Next-Gen';
  if (TARGET_CATEGORIES.includes(rawCategory)) return rawCategory;
  // ... (추가 매핑 로직이 있다면 이곳에 작성)
  return 'AI & Next-Gen';
};

// ✅ 4. 데이터 초기화
// demo_products_500.json이 없으므로 빈 배열로 초기화
const demoData: any[] = [];

// ✅ 5. 병합 로직
export const MERGED_PRODUCTS: Product[] = [
  // 1) 기본 데이터
  ...(CATEGORY_PRODUCTS.map((p) => ({
    ...p,
    // mapCategory의 두 번째 인자는 내부에서 사용 안 해도 전달은 해야 함
    category: mapCategory(p.category, p.name),
  })) as Product[]),

  // 2) 데모 데이터
  ...demoData.map((p) => {
    const id = Number(p.id) || 0;
    const price = Number(p.price) || 0;
    const name = String(p.name ?? '');
    const categoryRaw = String(p.category ?? '');
    return {
      ...p,
      id: id + 10000,
      price,
      category: mapCategory(categoryRaw, name),
    } as Product;
  }),
];

/**
 * ✅ 6. 데이터 업데이트 함수
 * [수정 완료] backendItems를 사용하지 않으므로 _backendItems로 변경하여 TS6133 에러 방지
 */
export const updateMergedProducts = (_backendItems: any[]) => {
  // 필요 시 MERGED_PRODUCTS를 갱신하는 로직 추가 가능
  // 현재는 로직이 없으므로 변수명 앞에 _를 붙여 에러를 방지함
};
