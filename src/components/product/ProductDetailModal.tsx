import { fetchHybridRecommendations } from '@/api/recommend';
import { useAuth } from '@/store/authStore';
import { useCart } from '@/store/cartStore';
import type { Product } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Radio,
  ShoppingCart,
  Sparkles,
  Star,
  X,
  Zap,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// [변경 1] 로컬 데모 데이터를 import 합니다.
// (경로는 실제 프로젝트 구조에 맞게 수정해주세요, 예: "@/data/demo_products_500.json")
import demoProductsRaw from '@/data/demo_products_500.json';

// demoProducts가 배열인지 확인하고 타입 캐스팅 (데이터 구조에 따라 다를 수 있음)
const allDemoProducts = (Array.isArray(demoProductsRaw)
  ? demoProductsRaw
  : []) as unknown as Product[];

type Recommendation = Product & {
  why?: string;
  confidence?: number;
};

export default function ProductDetailModal({
  product: initialProduct,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  // ... (기존 state 및 hook 코드는 동일) ...
  const [product, setProduct] = useState<Product>(initialProduct);
  const modalScrollRef = useRef<HTMLDivElement>(null);
  const infoScrollRef = useRef<HTMLDivElement>(null);
  const recsScrollRef = useRef<HTMLDivElement>(null);

  const { user, isLoggedIn } = useAuth();
  const addItem = useCart((state) => state.addItem);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const feedbackTimeoutRef = useRef<number | null>(null);
  const [recommendations, setRecommendations] = useState<
    Recommendation[] | null
  >(null);
  const [recsLoading, setRecsLoading] = useState(false);

  const userId = (user as any)?.id ?? 1;
  const navigate = useNavigate();

  // ... (scrollRecs, handleProductChange, handleBuyNow, handleAdd 등 기존 함수 동일) ...

  const scrollRecs = (direction: 'left' | 'right') => {
    if (recsScrollRef.current) {
      const scrollAmount = 400;
      recsScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleProductChange = (newProduct: Product) => {
    setProduct(newProduct);
    if (modalScrollRef.current) {
      modalScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (infoScrollRef.current) {
      infoScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBuyNow = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      qty: 1,
    });
    if (isLoggedIn) {
      navigate('/checkout');
    } else {
      navigate('/checkout-gateway');
    }
  };

  const handleAdd = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      qty: 1,
    });
    setAddedFeedback(true);
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }
    feedbackTimeoutRef.current = window.setTimeout(
      () => setAddedFeedback(false),
      1000,
    );
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
        feedbackTimeoutRef.current = null;
      }
    };
  }, []);

  // [변경 2] useEffect 로직 수정: API 실패/빈값 시 로컬 데이터 사용
  useEffect(() => {
    if (!product) return;
    const controller = new AbortController();
    let mounted = true;

    // 폴백 함수: 현재 상품과 같은 카테고리인 상품을 로컬 데이터에서 찾음
    const getFallbackRecommendations = (): Recommendation[] => {
      // 1. 현재 상품 제외
      let candidates = allDemoProducts.filter((p) => p.id !== product.id);

      // 2. 같은 카테고리 우선 필터링 (product.category가 배열일 수도 문자열일 수도 있음)
      const currentCat = Array.isArray(product.categories)
        ? product.categories[0]
        : product.category;

      const sameCategory = candidates.filter((p) => {
        const pCat = Array.isArray(p.categories) ? p.categories[0] : p.category;
        return pCat === currentCat;
      });

      // 3. 같은 카테고리가 있으면 그거 쓰고, 없으면 그냥 전체에서 랜덤 섞기
      const source = sameCategory.length >= 4 ? sameCategory : candidates;

      // 4. 랜덤으로 6개 뽑기 (간단한 shuffle)
      const shuffled = [...source].sort(() => 0.5 - Math.random()).slice(0, 6);

      // 5. why 속성 추가
      return shuffled.map((p) => ({
        ...p,
        why: sameCategory.length >= 4 ? 'Similar Category' : 'Popular Item',
        confidence: 0.8,
      }));
    };

    Promise.resolve().then(() => {
      if (mounted) setRecsLoading(true);
    });

    fetchHybridRecommendations(product.id, 6, controller.signal)
      .then((json) => {
        if (!mounted) return;
        let recs = Array.isArray(json?.recommendations)
          ? json.recommendations
          : Array.isArray(json)
            ? json
            : [];

        // [핵심] API 결과가 비어있으면 로컬 데이터에서 가져옴
        if (!recs || recs.length === 0) {
          console.log('API returned empty, using fallback data');
          recs = getFallbackRecommendations();
        }

        setRecommendations(recs);
      })
      .catch(() => {
        // [핵심] API 에러 시에도 로컬 데이터 사용
        if (mounted) {
          console.log('API failed, using fallback data');
          setRecommendations(getFallbackRecommendations());
        }
      })
      .finally(() => {
        if (mounted) setRecsLoading(false);
      });

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [product, userId]); // allDemoProducts는 static이라 의존성 제외 가능

  // ... (나머지 렌더링 로직 동일) ...
  const isSvg =
    typeof product.image === 'string' &&
    product.image.toLowerCase().endsWith('.svg');
  const getVal = (val?: string | string[]) =>
    Array.isArray(val) ? val.join(' / ') : (val ?? 'Information not specified');

  return (
    // ... (JSX 리턴 부분은 기존 코드 그대로 유지) ...
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* 기존 JSX 내용 복사 붙여넣기 */}
      <div
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl cursor-default"
        onClick={onClose}
      />
      <div
        ref={modalScrollRef}
        className="relative z-10 w-full max-w-6xl max-h-[90vh] bg-gradient-to-b from-slate-950 to-slate-900 border border-cyan-500/30 rounded-[2rem] shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden no-scrollbar"
      >
        {/* ... (이하 동일) ... */}

        {/* CLOSE BUTTON */}
        <div className="sticky top-6 right-6 z-50 flex justify-end w-full pointer-events-none pr-6 -mb-12 lg:absolute lg:top-6 lg:right-6 lg:mb-0 lg:pr-0">
          <button
            onClick={onClose}
            className="pointer-events-auto p-3 bg-white/5 backdrop-blur-sm border border-white/10 text-cyan-400 rounded-full hover:bg-cyan-500/20 hover:text-cyan-300 hover:border-cyan-500/30 transition-all group shadow-lg cursor-pointer"
          >
            <X
              size={20}
              className="group-hover:rotate-90 transition-transform duration-300"
            />
          </button>
        </div>

        {/* IMAGE SECTION */}
        <div
          className={`w-full lg:w-2/5 ${isSvg ? 'min-h-[300px]' : 'h-80 lg:h-auto'} relative flex-shrink-0 border-r border-white/5`}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              src={product.image}
              alt={product.name}
              className={`w-full h-full ${isSvg ? 'object-contain p-12' : 'object-cover'}`}
            />
          </AnimatePresence>
        </div>

        {/* INFO SECTION */}
        <div
          ref={infoScrollRef}
          className="flex-1 p-6 md:p-10 relative min-h-0 lg:overflow-y-auto lg:no-scrollbar"
        >
          {/* Header Info */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-cyan-400 text-[10px] font-black tracking-[0.2em] uppercase px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-md">
                {getVal(product.brand)}
              </span>
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest italic">
                SYSTEM ID: {product.id}
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none mb-2">
              {getVal(product.name)}
            </h2>
            <p className="text-cyan-500/60 font-mono text-sm uppercase tracking-tighter">
              Category:{' '}
              {Array.isArray(product.categories)
                ? product.categories.join(' / ')
                : product.category || 'General Module'}
            </p>
          </div>

          <div className="text-4xl font-black text-white mb-8 flex items-baseline gap-2">
            <span className="text-lg font-light text-cyan-500">$</span>
            {product.price?.toLocaleString() || '0'}
          </div>

          <div className="text-slate-400 text-sm leading-relaxed mb-10 max-w-2xl border-l-2 border-cyan-500/30 pl-4 py-1">
            {getVal(product.description)}
          </div>

          {/* Specs */}
          <div className="mb-10">
            <h3 className="text-white text-xs font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
              <Zap size={14} className="text-cyan-500" /> Technical Specs
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                'driver',
                'batteryLife',
                'noiseCancellation',
                'connectivity',
              ].map((specKey) => (
                <div
                  key={specKey}
                  className="bg-white/5 border border-white/5 p-3 rounded-xl"
                >
                  <div className="text-[9px] text-slate-500 uppercase font-black mb-1">
                    {specKey}
                  </div>
                  <div className="text-xs text-cyan-100 font-bold">
                    {product.specs?.[specKey] || 'Information not specified'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Connectivity */}
          <div className="mb-10 bg-cyan-500/5 border border-cyan-500/10 p-4 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-cyan-500/20 rounded-full text-cyan-400 font-bold">
              <Radio size={20} />
            </div>
            <div>
              <div className="text-[10px] text-cyan-500/70 font-black uppercase tracking-widest">
                Connection Protocol
              </div>
              <div className="text-sm text-white font-bold">
                {getVal(product.connectivity)}
              </div>
            </div>
          </div>

          {/* Buttons - Redesigned Colors */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            {/* ADD TO CART BUTTON */}
            <button
              onClick={handleAdd}
              disabled={addedFeedback}
              className={`cursor-pointer flex-1 py-5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all uppercase text-xs tracking-widest border
                ${
                  addedFeedback
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                    : 'bg-slate-950 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 hover:border-cyan-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                }
                `}
            >
              {addedFeedback ? (
                <>
                  <CheckCircle size={18} /> Synced
                </>
              ) : (
                <>
                  <ShoppingCart size={18} /> Add to Cart
                </>
              )}
            </button>

            {/* BUY NOW BUTTON */}
            <button
              onClick={handleBuyNow}
              className="cursor-pointer flex-1 py-5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all uppercase text-xs tracking-widest
                bg-white text-slate-950 border border-white shadow-[0_0_10px_rgba(255,255,255,0.3)]
                hover:bg-cyan-400 hover:text-slate-950 hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(34,211,238,0.6)]"
            >
              Buy Now
            </button>
          </div>

          {/* Reviews */}
          <div className="mb-12">
            <h3 className="text-white text-xs font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
              <MessageSquare size={14} className="text-cyan-500" /> User
              Feedback
            </h3>
            <div className="space-y-4">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex gap-1 text-cyan-500">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={10}
                            fill={i < rev.rating ? 'currentColor' : 'none'}
                            className={i < rev.rating ? '' : 'text-slate-700'}
                          />
                        ))}
                      </div>
                      <span className="text-[9px] text-slate-600 font-mono">
                        {rev.date}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white mb-1 uppercase italic tracking-tighter">
                      {rev.title}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {rev.body}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-slate-600 text-xs italic p-4 border border-dashed border-white/5 rounded-2xl uppercase tracking-tighter">
                  Information not specified
                </div>
              )}
            </div>
          </div>

          {/* RECOMMENDATIONS SECTION */}
          <div className="border-t border-white/5 pt-8 relative">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-white text-[10px] font-black uppercase tracking-[0.4em] italic opacity-50">
                Related Modules
              </h3>

              <div className="flex gap-8 px-4">
                <button
                  onClick={() => scrollRecs('left')}
                  className="p-2 rounded-full border border-white/10 bg-white/5 text-cyan-400 hover:bg-cyan-500 hover:text-black hover:border-cyan-400 transition-all duration-300"
                >
                  <ChevronLeft size={32} strokeWidth={2.5} />
                </button>
                <button
                  onClick={() => scrollRecs('right')}
                  className="p-2 rounded-full border border-white/10 bg-white/5 text-cyan-400 hover:bg-cyan-500 hover:text-black hover:border-cyan-400 transition-all duration-300"
                >
                  <ChevronRight size={32} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {recsLoading ? (
              <div className="text-cyan-500 font-mono text-[10px] animate-pulse uppercase">
                Scanning Database...
              </div>
            ) : (
              <div
                ref={recsScrollRef}
                className="flex gap-6 overflow-x-auto no-scrollbar py-6 px-1 scroll-smooth"
              >
                {recommendations?.map((r) => (
                  <div
                    key={r.id}
                    // 2) 추천 상품 네온 효과: hover 시 border 색상 변경 + shadow 추가
                    className="w-56 shrink-0 relative bg-white/[0.03] p-5 rounded-3xl border border-white/5
                                hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]
                                transition-all duration-300 group"
                  >
                    {/* FOR YOU 배지: 3) 글자 크기 반응형 (text-[10px] -> sm:text-xs) */}
                    <div className="mb-4">
                      <h4 className="text-cyan-400 text-[10px] sm:text-xs font-light uppercase tracking-[0.2em] flex items-center gap-1.5 shadow-cyan-500/20 drop-shadow-sm">
                        <Sparkles size={14} className="text-cyan-400" /> FOR YOU
                      </h4>
                    </div>

                    {/* ACCESS 버튼 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductChange(r);
                      }}
                      // 1) 커서 포인터(cursor-pointer)
                      // 3) 크기 반응형: 모바일(px-2 py-1) -> 데스크탑(sm:px-3 sm:py-1.5), 폰트도 반응형
                      className="absolute top-3 right-4 z-30 cursor-pointer overflow-hidden rounded-lg font-medium uppercase tracking-widest transition-all duration-300
                                    bg-white/5 ring-[0.5px] ring-white/10 text-slate-200
                                    hover:bg-cyan-500 hover:text-black hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]
                                    group/btn flex items-center justify-center
                                    px-2 py-1 text-[10px] sm:px-3 sm:py-1.5 sm:text-xs"
                    >
                      <span className="relative z-10 flex items-center gap-1 cursor-pointer">
                        ACCESS
                      </span>
                    </button>

                    <div className="aspect-square rounded-2xl overflow-hidden bg-slate-900 mt-8 mb-4">
                      <img
                        src={r.image}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        alt={r.name}
                      />
                    </div>
                    <div className="text-[11px] font-black text-white uppercase truncate mb-1 italic">
                      {r.name}
                    </div>
                    <div className="text-[10px] font-mono text-cyan-500 mb-2">
                      ${r.price.toLocaleString()}
                    </div>

                    <div className="mt-2 pt-2 border-t border-white/5">
                      <p className="text-[9px] leading-tight text-slate-500 font-medium group-hover:text-cyan-300 transition-colors italic">
                        {r.why || 'Information not specified'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
