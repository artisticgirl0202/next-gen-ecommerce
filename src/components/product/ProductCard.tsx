//ProductCard
import type { Product } from '@/types';
import { motion } from 'framer-motion';
import { Box, Cpu, Star, Zap } from 'lucide-react';
// 1. 카테고리 데이터 가져오기
import { CATEGORIES } from '@/data/categoryData';

// Recommendation 타입 정의
type Recommendation = Product & {
  why?: string;
  confidence?: number;
  title?: string; // OrderDetailPage 호환성을 위해 추가
};

type Props = {
  product: Recommendation;
  onOpen?: (p: Product) => void;
  compact?: boolean; // ✅ 수정: compact prop 추가 (타입 에러 해결)
};

/**
 * 🛠️ 스마트 카테고리 매핑 함수
 */
function resolveCategory(product: Product): string {
  // 1순위: 상품의 카테고리 배열 중 첫 번째가 표준 리스트에 있다면 사용
  const firstCat = product.categories?.[0];
  if (firstCat && CATEGORIES.includes(firstCat)) {
    return firstCat;
  }

  // 2순위: 단일 category 필드가 있고 표준 리스트에 있다면 사용
  const singleCat = (product as any).category;
  if (singleCat && CATEGORIES.includes(singleCat)) {
    return singleCat;
  }

  // 데이터 안전 장치: name이 없을 경우 대비
  const safeName = product.name || (product as any).title || '';
  const lowerName = safeName.toLowerCase();

  // 3순위: 상품명(name)을 분석하여 표준 카테고리 추론 (키워드 매칭)
  if (
    lowerName.includes('laptop') ||
    lowerName.includes('pc') ||
    lowerName.includes('mac')
  )
    return 'Computing Devices';
  if (
    lowerName.includes('phone') ||
    lowerName.includes('watch') ||
    lowerName.includes('galaxy') ||
    lowerName.includes('iphone')
  )
    return 'Mobile & Wearables';
  if (
    lowerName.includes('audio') ||
    lowerName.includes('sound') ||
    lowerName.includes('headphone') ||
    lowerName.includes('speaker') ||
    lowerName.includes('earbud')
  )
    return 'Audio Devices';
  if (
    lowerName.includes('camera') ||
    lowerName.includes('cam') ||
    lowerName.includes('lens')
  )
    return 'Cameras & Imaging';
  if (
    lowerName.includes('monitor') ||
    lowerName.includes('display') ||
    lowerName.includes('tv')
  )
    return 'Video & Display';
  if (
    lowerName.includes('game') ||
    lowerName.includes('console') ||
    lowerName.includes('controller')
  )
    return 'Gaming Gear';
  if (
    lowerName.includes('cable') ||
    lowerName.includes('charger') ||
    lowerName.includes('battery')
  )
    return 'Power & Charging';

  // 4순위: 그래도 없으면 기존 데이터 사용 혹은 기본값
  return firstCat || singleCat || 'AI & Next-Gen';
}

export default function ProductCard({
  product,
  onOpen,
  compact = false, // ✅ 수정: 기본값 설정
}: Props) {
  // ✅ 연결된 카테고리 로직 사용
  const displayCategory = resolveCategory(product);

  // ✅ 호환성 처리: OrderDetailPage에서 넘어오는 객체는 name 대신 title을 가질 수 있음
  const displayName = product.name || product.title || 'Unknown Product';

  const isSvg =
    typeof product.image === 'string' &&
    product.image.toLowerCase().endsWith('.svg');

  return (
    <motion.article
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`
        group relative flex flex-col h-full w-full
        bg-slate-900/60 backdrop-blur-xl
        border border-white/5 rounded-2xl
        overflow-hidden transition-all duration-300
        hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)]
        ${compact ? 'text-xs' : ''} 
      `}
    >
      {/* --- Image Section (Compact Square) --- */}
      <div className="relative aspect-square overflow-hidden bg-slate-950/80">
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/10 transition-colors duration-500 z-10 pointer-events-none" />

        <img
          src={product.image}
          alt={displayName}
          loading="lazy"
          className={`
            w-full h-full transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105
            ${isSvg ? 'object-contain p-6' : 'object-cover'}
          `}
        />

        {/* 🏷️ Category Badge */}
        <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-950/90 border border-white/10 backdrop-blur-md shadow-lg">
          <Box size={10} className="text-cyan-400" />
          <span className="text-[8px] font-mono font-bold text-slate-300 uppercase tracking-wider">
            {displayCategory}
          </span>
        </div>

        {/* AI Confidence (Minimalist) */}
        {product.confidence && (
          <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1 px-1.5 py-1 rounded-md bg-cyan-950/90 border border-cyan-500/20 backdrop-blur-md">
            <Zap size={10} className="text-cyan-400 fill-cyan-400" />
            <span className="text-[8px] font-mono font-bold text-cyan-100">
              {Math.round(product.confidence * 100)}%
            </span>
          </div>
        )}

        {/* AI Reason (Slide Up) */}
        {product.why && (
          <div className="absolute inset-x-0 bottom-0 z-20 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
            <div className="bg-slate-900/95 border border-cyan-500/30 p-2.5 rounded-lg shadow-2xl">
              <p className="text-[8px] text-cyan-400 font-bold mb-1 uppercase tracking-wider flex items-center gap-1">
                <Cpu size={8} /> Neural Match
              </p>
              <p className="text-[9px] text-slate-300 leading-snug line-clamp-2">
                {product.why}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* --- Content Section (Tight & Clean) --- */}
      <div className="flex flex-col flex-grow p-3 gap-2 bg-gradient-to-b from-slate-900/50 to-white/[0.02]">
        {/* Title & Brand */}
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-100 truncate font-sans group-hover:text-cyan-300 transition-colors">
            {displayName}
          </h3>
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
            {product.brand || 'UNKNOWN'}
          </p>
        </div>

        {/* Price & Rating Row */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
          <div className="flex items-baseline gap-0.5">
            <span className="text-xs font-medium text-cyan-600">$</span>
            <span className="text-base font-black text-white tracking-tight">
              {product.price.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Star size={10} className="text-yellow-500 fill-yellow-500" />
            <span className="text-[10px] font-bold text-slate-400 font-mono">
              {product.rating ?? '4.8'}
            </span>
          </div>
        </div>

        {/* ✅ Compact 모드가 아닐 때만 Access 버튼 표시
          (Compact 모드에서는 공간 절약을 위해 숨김)
        */}
        {!compact && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpen?.(product);
            }}
            className="
            w-full relative overflow-hidden rounded-lg
            bg-white/5 border border-white/10 text-slate-300
            hover:bg-cyan-500 hover:text-slate-950 hover:border-cyan-400 
            transition-all duration-200 cursor-pointer
            flex items-center justify-center gap-2
            py-2 mt-1 group/btn
          "
          >
            <span className="text-[9px] font-black uppercase tracking-[0.2em] relative z-10">
              Access
            </span>

            {/* Subtle Scanline Animation */}
            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/btn:animate-[shimmer_0.8s_infinite] z-0" />
          </button>
        )}
      </div>
    </motion.article>
  );
}
