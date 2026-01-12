// src/components/product/ProductCard.tsx
import { CATEGORIES } from '@/data/categoryData';
import type { Product } from '@/types';
import { motion } from 'framer-motion';
import { Activity, Box, Cpu, Star } from 'lucide-react';

// Recommendation 타입 정의
type Recommendation = Product & {
  why?: string;
  confidence?: number;
  title?: string;
};

type Props = {
  product: Recommendation;
  onOpen?: (p: Product) => void;
  compact?: boolean;
};

function resolveCategory(product: Product): string {
  // 1. 데이터에 명시된 카테고리가 공식 리스트에 있으면 최우선 사용
  const firstCat = product.categories?.[0];
  if (firstCat && CATEGORIES.includes(firstCat)) return firstCat;

  const singleCat = (product as any).category;
  if (singleCat && CATEGORIES.includes(singleCat)) return singleCat;

  // 2. 카테고리 정보가 불확실할 때, 상품명(name/title) 기반 추론
  const safeName = (product.name || (product as any).title || '').toLowerCase();

  // --- [Computing Devices] ---
  if (
    safeName.includes('laptop') ||
    safeName.includes('pc') ||
    safeName.includes('computer') ||
    safeName.includes('tablet') ||
    safeName.includes('macbook') ||
    safeName.includes('desktop')
  ) {
    return 'Computing Devices';
  }

  // --- [Mobile & Wearables] ---
  if (
    safeName.includes('phone') ||
    safeName.includes('watch') ||
    safeName.includes('mobile') ||
    safeName.includes('wearable') ||
    safeName.includes('galaxy') ||
    safeName.includes('iphone')
  ) {
    return 'Mobile & Wearables';
  }

  // --- [Audio Devices] ---
  if (
    safeName.includes('audio') ||
    safeName.includes('sound') ||
    safeName.includes('speaker') ||
    safeName.includes('headphone') ||
    safeName.includes('earbud') ||
    safeName.includes('headset')
  ) {
    return 'Audio Devices';
  }

  // --- [Video & Display] ---
  if (
    safeName.includes('monitor') ||
    safeName.includes('display') ||
    safeName.includes('tv') ||
    safeName.includes('screen') ||
    safeName.includes('projector')
  ) {
    return 'Video & Display';
  }

  // --- [Cameras & Imaging] ---
  if (
    safeName.includes('camera') ||
    safeName.includes('lens') ||
    safeName.includes('dslr') ||
    safeName.includes('camcorder') ||
    safeName.includes('drone')
  ) {
    return 'Cameras & Imaging';
  }

  // --- [Peripherals] (키보드, 마우스 등) ---
  if (
    safeName.includes('mouse') ||
    safeName.includes('keyboard') ||
    safeName.includes('printer') ||
    safeName.includes('trackpad') ||
    safeName.includes('scanner')
  ) {
    return 'Peripherals';
  }

  // --- [Gaming Gear] ---
  if (
    safeName.includes('game') ||
    safeName.includes('gaming') ||
    safeName.includes('console') ||
    safeName.includes('controller') ||
    safeName.includes('xbox') ||
    safeName.includes('playstation')
  ) {
    return 'Gaming Gear';
  }

  // --- [Smart Home & IoT] ---
  if (
    safeName.includes('smart') ||
    safeName.includes('iot') ||
    safeName.includes('bulb') ||
    safeName.includes('light') ||
    safeName.includes('thermostat') ||
    safeName.includes('sensor')
  ) {
    return 'Smart Home & IoT';
  }

  // --- [Network & Comm] ---
  if (
    safeName.includes('network') ||
    safeName.includes('wifi') ||
    safeName.includes('router') ||
    safeName.includes('modem') ||
    safeName.includes('switch')
  ) {
    return 'Network & Comm';
  }

  // --- [Power & Charging] ---
  if (
    safeName.includes('cable') ||
    safeName.includes('charger') ||
    safeName.includes('battery') ||
    safeName.includes('power') ||
    safeName.includes('adapter')
  ) {
    return 'Power & Charging';
  }

  // --- [Components] (부품) ---
  if (
    safeName.includes('cpu') ||
    safeName.includes('gpu') ||
    safeName.includes('ram') ||
    safeName.includes('memory') ||
    safeName.includes('ssd') ||
    safeName.includes('hdd') ||
    safeName.includes('graphic') ||
    safeName.includes('motherboard') ||
    safeName.includes('cooler') ||
    safeName.includes('case')
  ) {
    return 'Components';
  }

  // 3. 매칭되는 것이 없으면 기타/AI로 분류
  return 'AI & Next-Gen';
}

const getTranslatedReason = (text: string) => {
  if (!text) return '';

  // 이미 영어인 경우 그대로 반환 (ASCII 체크)
  if (/^[\x00-\x7F]*$/.test(text)) return text;

  // 1순위: '콘텐츠'와 '유사'가 둘 다 있는 경우
  if (text.includes('콘텐츠') && text.includes('유사'))
    return 'Content Similarity';

  // 2순위: 단일 키워드 매핑
  if (text.includes('콘텐츠')) return 'Content pattern match';
  if (text.includes('유사')) return 'Based on similarity';
  if (text.includes('대체')) return 'Alternative recommendation';
  if (text.includes('기본')) return 'Basic recommendation';
  if (text.includes('인기')) return 'Popular choice';
  if (text.includes('카테고리')) return 'Category match';

  // 매핑되지 않은 나머지
  return 'AI Suggested';
};
export default function ProductCard({
  product,
  onOpen,
  compact = false,
}: Props) {
  const displayCategory = resolveCategory(product);
  const displayName = product.name || product.title || 'Unknown Unit';
  const isSvg =
    typeof product.image === 'string' &&
    product.image.toLowerCase().endsWith('.svg');

  return (
    <motion.article
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`
        group relative flex flex-col h-full w-full
        bg-slate-950/80 backdrop-blur-md
        rounded-2xl overflow-hidden
        border border-white/5
        transition-all duration-500 ease-out
        hover:border-cyan-500/40 hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.25)]
        hover:bg-slate-950/90
        ${compact ? 'text-xs' : ''} 
      `}
    >
      {/* --- Image Section (Sleek HUD View) --- */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          onOpen?.(product);
        }}
        data-cursor-interactive="true"
        className="relative w-full aspect-square overflow-hidden bg-slate-900/50"
      >
        {/* Holographic Scan Effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/0 via-cyan-400/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10" />

        <img
          src={product.image}
          alt={displayName}
          loading="lazy"
          className={`
            w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]
            group-hover:scale-105
            ${isSvg ? 'object-contain p-8' : 'object-cover'}
          `}
        />

        {/* 🏷️ System Badge (Capsule Style) */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 bg-slate-950/60 border border-white/10 backdrop-blur-md rounded-full group-hover:border-cyan-500/30 transition-colors">
          <Box
            size={10}
            className="text-slate-400 group-hover:text-cyan-400 transition-colors"
          />
          <span className="text-[8px] font-mono font-bold text-slate-300 uppercase tracking-wider">
            {displayCategory.slice(0, 12)}
          </span>
        </div>

        {/* ⚡ AI Confidence (Glowing Capsule) */}
        {product.confidence && (
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 pl-1.5 pr-2 py-1 bg-cyan-950/60 border border-cyan-500/20 backdrop-blur-md rounded-full shadow-[0_0_10px_rgba(6,182,212,0.1)] group-hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-shadow">
            <Activity size={10} className="text-cyan-400" />
            <span className="text-[9px] font-mono font-bold text-cyan-100">
              {Math.round(product.confidence * 100)}%
            </span>
          </div>
        )}

        {/* 🗨️ AI Reason Overlay (Smooth Slide) */}
        {product.why && (
          <div className="hidden md:block absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]">
            <div className="flex items-start gap-2 p-2 rounded-xl bg-cyan-950/30 border border-cyan-500/20 backdrop-blur-sm">
              <Cpu size={12} className="text-cyan-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-cyan-100/90 font-mono leading-relaxed line-clamp-2">
                {getTranslatedReason(product.why)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* --- Content Section (Data Panel) --- */}
      <div className="flex flex-col flex-grow p-4 relative">
        {/* Subtle Glow Separator */}
        <div className="absolute top-0 inset-x-4 h-px bg-gradient-to-r from-transparent via-white/10 group-hover:via-cyan-500/30 to-transparent transition-colors duration-500" />

        {/* Title & Brand */}
        <div className="mb-3 mt-1">
          <h3 className="text-xs sm:text-sm font-bold text-slate-200 font-sans uppercase tracking-tight group-hover:text-white transition-colors line-clamp-1">
            {displayName}
          </h3>
          <div className="flex justify-between items-center mt-1">
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.15em]">
              {product.brand || 'GENERIC'}
            </p>
            <span className="text-[8px] font-mono text-slate-600 group-hover:text-cyan-500/70 transition-colors">
              ID: {product.id || 'NULL'}
            </span>
          </div>
        </div>

        {/* Stats Interface */}
        <div className="flex items-end justify-between mt-auto pt-3">
          {/* Price Data */}
          <div>
            <div className="flex items-baseline gap-0.5 text-cyan-400 group-hover:text-cyan-300 transition-colors">
              <span className="text-xs font-medium opacity-70">$</span>
              <span className="text-lg font-black font-mono tracking-tighter">
                {product.price.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Rating Capsule */}
          <div className="flex items-center gap-1.5 bg-slate-900/50 px-2 py-1 rounded-full border border-white/5 group-hover:border-white/10 transition-colors">
            <Star size={10} className="text-yellow-500 fill-yellow-500" />
            <span className="text-[10px] font-bold text-slate-300 font-mono pt-0.5">
              {product.rating ?? '4.8'}
            </span>
          </div>
        </div>

        {/* 🔘 Activation Button (Sleek Capsule) */}
        {!compact && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpen?.(product);
            }}
            className="
              relative w-full mt-4 group/btn overflow-hidden rounded-xl
              bg-gradient-to-r from-cyan-900/20 to-cyan-800/20
              border border-cyan-500/20
              hover:border-cyan-400/50 hover:from-cyan-500/10 hover:to-cyan-400/20
              focus:outline-none transition-all duration-300
            "
          >
            <div className="relative z-10 py-2.5 flex items-center justify-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 group-hover/btn:text-cyan-200 transition-colors pt-0.5">
                Access
              </span>
            </div>

            {/* Animated Glow Bar */}
            <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 blur-[2px]" />
          </button>
        )}
      </div>
    </motion.article>
  );
}
