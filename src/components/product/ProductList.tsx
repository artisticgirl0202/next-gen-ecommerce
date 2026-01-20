'use client';

// ✅ [변경] 실시간 백엔드 데이터가 병합되는 통합 인덱스 파일을 가져옵니다.
import { ALL_PRODUCTS } from '@/data/products_indexed';
import type { Product } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';

import BentoCard from '../ui/BentoCard';
import ProductDetailModal from './ProductDetailModal';

// --- Types ---
interface ProductListProps {
  category: string;
  searchQuery: string;
  sortBy: string;
  viewMode: 'grid' | 'list';
  limit?: number;
  brands?: string[];
}

// 🛠️ 헬퍼 함수: 대소문자/띄어쓰기 무시 (Null Check 강화)
const normalize = (str?: string) =>
  (str ?? '').toLowerCase().replace(/\s+/g, '') || '';

export default function ProductList({
  category = 'All',
  searchQuery,
  sortBy,
  viewMode,
  limit,
  brands = [],
}: ProductListProps) {
  // --- State ---
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // 렌더링 성능을 위해 처음에 24개만 보여주고 스크롤 시 더 보여줌
  const [visibleCount, setVisibleCount] = useState<number>(24);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // 카테고리나 필터 변경 시 스크롤 및 개수 초기화
  useEffect(() => {
    Promise.resolve().then(() => setVisibleCount(24));
  }, [category, searchQuery, sortBy, brands]);

  // --- Logic: Filtering & Sorting ---
  const filteredProducts = useMemo(() => {
    // ✅ [변경] 백엔드 데이터가 포함된 실시간 통합 리스트를 복사하여 사용합니다.
    let list = [...ALL_PRODUCTS];

    // 1. Category Filter
    const targetCategory = normalize(category);
    if (targetCategory !== 'all') {
      list = list.filter((p) => normalize(p.category) === targetCategory);
    }

    // 2. Search Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          // 🛡️ [수정] p.name이 없을 경우를 대비해 빈 문자열 처리
          (p.name || '').toLowerCase().includes(q) ||
          (p.brand || '').toLowerCase().includes(q),
      );
    }

    // 3. Brand Filter
    if (brands.length > 0) {
      list = list.filter((p) => p.brand && brands.includes(p.brand));
    }

    // 4. Sorting
    // 🛡️ [수정] price가 undefined일 경우 0으로 취급하여 계산 (NaN 방지)
    if (sortBy === 'price_low') {
      // ✅ [수정] Number()로 감싸서 확실한 숫자 타입 보장
      list.sort((a, b) => Number(a.price ?? 0) - Number(b.price ?? 0));
    } else if (sortBy === 'price_high') {
      // ✅ [수정] Number()로 감싸서 확실한 숫자 타입 보장
      list.sort((a, b) => Number(b.price ?? 0) - Number(a.price ?? 0));
    }
    // sortBy가 "newest"이거나 없으면 인덱싱된 순서(기본 -> 백엔드 추가분) 유지

    return list;
    // ✅ [중요] ALL_PRODUCTS.length를 감지하여 백엔드 데이터 로드 완료 시 자동으로 목록을 갱신합니다.
  }, [category, searchQuery, sortBy, brands, ALL_PRODUCTS.length]);

  // --- Pagination (Infinite Scroll) ---
  const displayedProducts = useMemo(() => {
    const sliced = filteredProducts.slice(0, visibleCount);
    if (limit) return sliced.slice(0, limit);
    return sliced;
  }, [filteredProducts, visibleCount, limit]);

  const hasMore = visibleCount < filteredProducts.length;

  useEffect(() => {
    if (!hasMore || limit) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + 24);
        }
      },
      { threshold: 0.1, rootMargin: '200px' },
    );

    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, limit]);

  const isList = viewMode === 'list';

  // 🛡️ 클릭 핸들러: 타입을 안전하게 변환하여 State에 저장
  const handleProductClick = (product: any) => {
    // Product 타입과 호환되도록 강제 형변환 (필요시 id 확인 로직 추가 가능)
    setSelectedProduct(product as Product);
  };

  return (
    <>
      <motion.div
        layout
        className={`
          gap-1 w-full
          ${
            isList
              ? 'flex flex-col gap-4'
              : 'grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 auto-rows-fr'
          }
        `}
      >
        <AnimatePresence mode="popLayout">
          {displayedProducts.map((product, idx) => {
            // 키 충돌 방지를 위해 idx 포함
            const uniqueKey = `prod-${product.id}-${idx}`;
            const isSvg =
              typeof product.image === 'string' &&
              product.image.toLowerCase().endsWith('.svg');

            return (
              <motion.div
                key={uniqueKey}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full"
              >
                <BentoCard
                  className={`
                    group relative bg-slate-900/40 border border-white/5 rounded-[1.5rem] sm:rounded-[2rem]
                    transition-all duration-500 hover:border-cyan-500/50 hover:bg-slate-900/60
                    hover:shadow-[0_0_40px_rgba(6,182,212,0.1)]
                    w-full h-full flex flex-col

                    ${
                      isList
                        ? 'p-4 md:p-6 md:flex-row md:items-stretch gap-4 md:gap-8'
                        : 'p-3 sm:p-5 gap-2 sm:gap-3'
                    }
                  `}
                >
                  {/* --- Image --- */}
                  <div
                    data-cursor-interactive="true"
                    className={`
                    relative overflow-hidden shrink-0 border border-white/5 rounded-xl
                    ${
                      isList
                        ? 'w-full aspect-video md:w-[240px] md:aspect-auto md:h-auto'
                        : 'w-full aspect-[4/3]'
                    }
                  `}
                  >
                    <img
                      src={product.image}
                      alt={product.name || 'Product Image'}
                      loading="lazy"
                      className={`
                        w-full h-full transition-transform duration-700 group-hover:scale-105
                        ${isSvg ? 'object-contain p-6 md:p-8' : 'object-cover'}
                      `}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://placehold.co/400x300/1e293b/475569?text=No+Image';
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductClick(product);
                      }}
                    />
                    <div
                      data-cursor-interactive="true"
                      className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-40 pointer-events-none"
                    />
                  </div>

                  {/* --- Content --- */}
                  <div
                    className={`
                    flex flex-1
                    ${
                      isList
                        ? 'flex-col md:flex-row md:items-center p-0'
                        : 'flex-col pt-1'
                    }
                  `}
                  >
                    {/* Info */}
                    <div
                      className={`flex flex-col ${isList ? 'flex-1 md:items-start md:justify-center' : 'w-full'}`}
                    >
                      <div className="flex justify-between items-center w-full mb-1 sm:mb-0">
                        <span
                          className={`text-cyan-400 font-black tracking-[0.2em] uppercase drop-shadow-md ${isList ? 'text-xs mb-1' : 'text-[10px] sm:text-xs'}`}
                        >
                          {product.brand || 'BRAND'}
                        </span>
                      </div>

                      <h3
                        className={`font-bold text-white uppercase italic leading-tight group-hover:text-cyan-50 transition-colors ${isList ? 'text-lg md:text-2xl mb-2 line-clamp-1' : 'text-base sm:text-xl md:text-2xl mt-1 line-clamp-2'}`}
                      >
                        {product.name}
                      </h3>

                      {(product.description || isList) && (
                        <p
                          className={`text-slate-400 leading-relaxed opacity-80 ${isList ? 'text-sm line-clamp-2 md:line-clamp-2 w-full max-w-2xl' : 'text-[10px] sm:text-sm line-clamp-2'}`}
                        >
                          {product.description ||
                            'High-performance tech designed for the future.'}
                        </p>
                      )}

                      {isList && (
                        <div className="hidden md:inline-flex mt-3 px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-slate-400 uppercase tracking-widest w-fit">
                          {product.category || 'ETC'}
                        </div>
                      )}
                    </div>

                    {/* Bottom Info / Action */}
                    <div
                      className={`flex ${isList ? 'flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 md:min-w-[140px] md:border-l md:border-white/5 md:pl-8 mt-2 md:mt-0' : 'flex-col gap-2 mt-auto border-t border-white/5 pt-2 sm:pt-3 w-full'}`}
                    >
                      {!isList && (
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 mb-1">
                          <span className="hidden md:inline-block text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                            {product.category || 'ETC'}
                          </span>
                        </div>
                      )}

                      <div
                        className={`${isList ? 'md:text-right' : 'flex items-center justify-between pb-4'}`}
                      >
                        <span
                          className={`font-black text-white tracking-tight ${isList ? 'text-xl md:text-2xl' : 'text-lg sm:text-2xl'}`}
                        >
                          ${(product.price ?? 0).toLocaleString()}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProductClick(product);
                        }}
                        className={`
                        relative group/btn overflow-hidden rounded-xl
                        
                        /* 1. 배경 & 테두리 (Future Tech Style) */
                        bg-gradient-to-r from-cyan-900/20 to-cyan-800/20
                        border border-cyan-500/20
                        
                        /* 2. 호버 효과 (Glow & Lighten) */
                        hover:border-cyan-400/50 hover:from-cyan-500/10 hover:to-cyan-400/20
                        focus:outline-none transition-all duration-300
                        
                        /* 3. 기본 레이아웃 */
                        flex items-center justify-center cursor-pointer
                        
                        /* 4. 조건부 크기 (기존 로직 유지 + 반응형 보완) */
                        ${
                          isList
                            ? 'px-6 py-2 md:py-3 md:w-full' // 리스트 뷰: 버튼 크기 최적화
                            : 'w-full py-2 sm:py-3' // 그리드 뷰: 꽉 찬 너비
                        }
                      `}
                      >
                        {/* 텍스트 컨텐츠 */}
                        <span
                          className={`
                          relative z-10 font-black uppercase tracking-[0.2em] 
                          text-cyan-400 group-hover/btn:text-cyan-200 transition-colors pt-0.5 flex items-center gap-2
                          ${isList ? 'text-[10px] sm:text-xs' : 'text-[10px] sm:text-sm'}
                        `}
                        >
                          Access
                        </span>

                        {/* 5. 하단 글로우 바 애니메이션 (디자인 포인트) */}
                        <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 blur-[2px]" />
                      </button>
                    </div>
                  </div>
                  <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
                </BentoCard>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Loader */}
      {!limit && (
        <div className="flex flex-col items-center justify-center mt-12 mb-20 gap-4">
          {hasMore ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-cyan-500 font-mono text-xs animate-pulse tracking-widest">
                LOADING DATA...
              </span>
            </div>
          ) : (
            <div className="text-slate-600 text-xs font-mono uppercase tracking-widest opacity-50">
              // END OF STREAM //
            </div>
          )}
          <div
            ref={loadMoreRef}
            className="h-1 w-full opacity-0 pointer-events-none"
          />
        </div>
      )}

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
}
