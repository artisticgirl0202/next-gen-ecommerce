// 예: src/pages/ShopPage.tsx (또는 App.tsx의 메인 부분)
import Header from "@/components/layout/Header";
import ProductList from "@/components/product/ProductList";
import { useSearchParams } from "react-router-dom";

export default function ShopPage() {
  // 1. URL 파라미터 읽기
  const [searchParams] = useSearchParams();

  // 2. 파라미터 값 추출 (없으면 기본값 설정)
  const activeCategory = searchParams.get("category") || "All";
  const viewMode = (searchParams.get("view") as "grid" | "list") || "grid";
  const sortBy = (searchParams.get("sort") as any) || "newest";

  // 브랜드는 콤마(,)로 구분된 문자열로 오므로 배열로 변환
  const brandParam = searchParams.get("brands");
  const activeBrands = brandParam ? brandParam.split(",") : [];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* 3. Header에 현재 상태 전달 (버튼 활성화를 위해) */}
      <Header
        activeCategory={activeCategory}
        viewMode={viewMode}
        sortBy={sortBy}
        brands={activeBrands}
      />

      <main className="pt-40 pb-20 px-4 md:px-6 max-w-7xl mx-auto">
         <div className="mb-8">
            <h1 className="text-3xl font-black text-white mb-2">
              {activeCategory === "All" ? "All Products" : activeCategory}
            </h1>
            <p className="text-slate-400 text-sm">
              Explore our collection of next-generation technology.
            </p>
         </div>

         {/* 4. ProductList에 필터 조건 전달 */}
         <ProductList
            category={activeCategory}
            viewMode={viewMode}
            sortBy={sortBy}
            brands={activeBrands}
         />
      </main>
    </div>
  );
}
