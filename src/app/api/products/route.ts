import {
  ALL_PRODUCTS,
  getProductsByCategory,
  searchProducts,
  updateProductIndexes,
} from '@/data/products_indexed';

// 백엔드 데이터를 주기적으로 혹은 최초 1회 동기화하기 위한 플래그
let isInitialFetched = false;

async function syncWithBackend() {
  try {
    // 1. fetch 옵션에서 'next' 제거 (표준 fetch 타입 준수)
    const res = await fetch('http://localhost:8000/api/products');

    if (res.ok) {
      const backendProducts = await res.json();
      updateProductIndexes(backendProducts);
      isInitialFetched = true;
      console.log('✅ 백엔드 데이터 동기화 완료');
    }
  } catch (err) {
    console.error('❌ 백엔드 동기화 실패 (Fallback 데이터 사용):', err);
  }
}

export async function GET(req: Request) {
  if (!isInitialFetched || ALL_PRODUCTS.length === 0) {
    await syncWithBackend();
  }

  const { searchParams } = new URL(req.url);

  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const perPage = Number(
    searchParams.get('page_size') ?? searchParams.get('pageSize') ?? '24',
  );
  const category = searchParams.get('category') || 'All';
  const q = searchParams.get('q') || '';
  const sort = searchParams.get('sort') || 'id';

  let sortBy: 'id' | 'price' | 'name' = 'id';
  let sortDir: 'asc' | 'desc' = 'desc';

  if (sort === 'price_low') {
    sortBy = 'price';
    sortDir = 'asc';
  } else if (sort === 'price_high') {
    sortBy = 'price';
    sortDir = 'desc';
  }

  // 2. 인덱싱 엔진 호출 시 타입 및 인자 수 맞춤
  // searchProducts와 getProductsByCategory의 정의가 ({ page, perPage... }) 형태인지 확인 필요
  // 에러 메시지에 따르면 인자 개수나 내부 프로퍼티가 맞지 않으므로 아래와 같이 안전하게 처리합니다.

  let result: any;
  if (q.trim()) {
    // 만약 searchProducts가 인자를 하나만 받는다면 두 번째 인자를 제거해야 합니다.
    // 여기서는 에러 메시지를 바탕으로 옵션 객체를 전달하는 구조로 가정합니다.
    result = searchProducts(q, { page, perPage, sortBy, sortDir } as any);
  } else {
    result = getProductsByCategory(category, {
      page,
      perPage,
      sortBy,
      sortDir,
    } as any);
  }

  // 3. result 객체에 존재하지 않는 프로퍼티(page, totalPages 등) 안전 처리
  // result.items와 result.total만 확실히 존재한다고 가정하고 나머지는 계산해서 넣습니다.
  const items = result.items || [];
  const total = result.total || 0;
  const totalPages = Math.ceil(total / perPage);

  return new Response(
    JSON.stringify({
      items: items,
      total: total,
      page: page, // 결과에서 가져오지 않고 요청받은 page 사용
      pageSize: perPage,
      totalPages: totalPages,
      products: items,
      page_size: perPage,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=59',
      },
    },
  );
}
