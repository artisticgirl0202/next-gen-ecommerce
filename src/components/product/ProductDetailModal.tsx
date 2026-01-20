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

import { fetchHybridRecsAPI, sendAIFeedbackAPI } from '@/api/integration';
import { ALL_PRODUCTS } from '@/data/products_indexed';

const allDemoProducts = (Array.isArray(ALL_PRODUCTS)
  ? ALL_PRODUCTS
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
  const [product, setProduct] = useState<Product>(initialProduct);
  const [recommendations, setRecommendations] = useState<
    Recommendation[] | null
  >(null);
  const [recsLoading, setRecsLoading] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);

  const modalScrollRef = useRef<HTMLDivElement>(null);
  const infoScrollRef = useRef<HTMLDivElement>(null);
  const recsScrollRef = useRef<HTMLDivElement>(null);
  const feedbackTimeoutRef = useRef<number | null>(null);

  const { user, isLoggedIn } = useAuth();
  const userId = (user as any)?.id ?? 0;
  const addItem = useCart((state) => state.addItem);
  const navigate = useNavigate();
  useEffect(() => {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }, []);
  // 헬퍼: 추천 데이터 없을 시 로컬 데이터 사용
  const getFallbackRecommendations = (): Recommendation[] => {
    if (!allDemoProducts || allDemoProducts.length === 0) return [];
    return allDemoProducts
      .filter((p) => p.id !== product.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 5)
      .map((p) => ({
        ...p,
        why: 'Popular in this category',
        confidence: 0.8,
      }));
  };

  // 통합된 useEffect: 추천 데이터 가져오기 및 AI 로그 전송
  useEffect(() => {
    if (!product) return;

    // 1. 추천 로딩 시작
    setRecsLoading(true);
    setRecommendations(null); // 이전 데이터 초기화

    fetchHybridRecsAPI(product.id)
      .then((recs) => {
        if (recs && recs.length > 0) {
          setRecommendations(recs);
        } else {
          console.log('Using local fallback recommendations');
          setRecommendations(getFallbackRecommendations());
        }
      })
      .catch((err) => {
        console.error('Failed to fetch recs:', err);
        setRecommendations(getFallbackRecommendations());
      })
      .finally(() => {
        setRecsLoading(false);
      });

    // 2. 상세 페이지 진입 로그(Interaction) 전송
    sendAIFeedbackAPI({
      userId: String(userId),
      productId: product.id,
      action: 'view_details',
      orderId: -1,
    });

    console.log(`📡 Event Sent: view_details for Product ${product.id}`);
  }, [product.id, userId]); // product.id가 바뀌면 재실행

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
    // 스크롤 초기화
    if (modalScrollRef.current)
      modalScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    if (infoScrollRef.current)
      infoScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
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

    // UI 피드백
    setAddedFeedback(true);
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    feedbackTimeoutRef.current = window.setTimeout(
      () => setAddedFeedback(false),
      1000,
    );

    // AI 피드백 전송
    sendAIFeedbackAPI({
      userId: String(userId),
      productId: product.id,
      action: 'add_to_cart',
    });
  };

  const isSvg =
    typeof product.image === 'string' &&
    product.image.toLowerCase().endsWith('.svg');
  const getVal = (val?: string | string[]) =>
    Array.isArray(val) ? val.join(' / ') : (val ?? 'Information not specified');
  const translateWhy = (text: string | undefined): string => {
    if (!text) return 'Optimal match based on profile.';

    // 이미 영어인 경우 그대로 반환
    if (/^[A-Za-z0-9\s.,!'-]+$/.test(text)) return text;

    // 키워드 매핑
    if (text.includes('콘텐츠') || text.includes('패턴'))
      return 'Content pattern match';
    if (text.includes('유사') || text.includes('비슷한'))
      return 'Based on product similarity';
    if (text.includes('대체')) return 'Strategic alternative';
    if (text.includes('인기') || text.includes('많이 찾'))
      return 'Trending in this category';
    if (text.includes('함께') || text.includes('자주'))
      return 'Frequently bought together';
    if (text.includes('선호') || text.includes('취향'))
      return 'Refinement of your preference';
    if (text.includes('카테고리')) return 'Category-specific suggestion';

    return 'AI Suggested Neural Match'; // 기본값
  };
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl cursor-default"
        onClick={onClose}
      />
      <div
        ref={modalScrollRef}
        className="relative z-[2000] w-full max-w-6xl max-h-[90vh] bg-gradient-to-b from-slate-950 to-slate-900 border border-cyan-500/30 rounded-[2rem] shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden no-scrollbar"
      >
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

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <button
              onClick={handleAdd}
              disabled={addedFeedback}
              className={`cursor-pointer flex-1 py-5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all uppercase text-xs tracking-widest border
                ${
                  addedFeedback
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                    : 'bg-slate-950 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 hover:border-cyan-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                }`}
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
              <div className="flex gap-6 py-6 px-1 overflow-hidden">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-56 shrink-0 h-[380px] rounded-3xl bg-slate-900/30 border border-white/5 relative overflow-hidden flex items-center justify-center"
                  >
                    <div className="text-cyan-500/50 font-mono text-[10px] animate-pulse uppercase tracking-widest">
                      Scanning...
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                ref={recsScrollRef}
               className="flex gap-6 overflow-x-auto pb-8 px-8 snap-x
              [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
              [mask-image:linear-gradient(to_right,transparent,black_0.2%,black_99.8%,transparent)]"
              >
                {recommendations?.map((r) => (
                  <div
                    key={r.id}
                    className="w-56 shrink-0 relative p-4 flex flex-col snap-center bg-gradient-to-br from-slate-900/80 to-slate-900/40 backdrop-blur-md rounded-3xl border border-white/10 hover:border-cyan-500/40 hover:bg-slate-800/60 hover:shadow-[0_0_30px_-10px_rgba(6,182,212,0.3)] transition-all duration-500 ease-out group"
                  >
                    <div className="flex-1 mb-3">
                      <div className="mb-3 flex justify-between items-start">
                        <h4 className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/5 border border-cyan-500/10 text-cyan-400 text-[10px] font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                          <Sparkles size={10} className="text-cyan-300" /> For
                          You
                        </h4>
                      </div>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProductChange(r);
                        }}
                        className="aspect-square rounded-2xl overflow-hidden bg-slate-950/50 border border-white/5 relative mb-4 group-hover:border-cyan-500/20 transition-colors duration-500"
                      >
                        <img
                          src={r.image}
                          alt={r.name}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <div className="text-[11px] font-black text-slate-200 uppercase leading-tight group-hover:text-cyan-200 transition-colors line-clamp-2">
                            {r.name}
                          </div>
                          <div className="text-[11px] font-mono font-bold text-cyan-400 shrink-0">
                            ${r.price.toLocaleString()}
                          </div>
                        </div>
                        <div className="pt-2 mt-2 border-t border-white/5">
                          <p className="text-[10px] leading-relaxed text-slate-500 font-medium group-hover:text-slate-400 transition-colors italic line-clamp-2">
                            <span className="text-cyan-600/70 not-italic font-bold mr-1 text-[8px] uppercase tracking-wider">
                              Analysis:
                            </span>
                            {translateWhy(r.why) ||
                              'Optimal match based on profile.'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductChange(r);
                      }}
                      className="relative group/btn overflow-hidden rounded-xl bg-gradient-to-r from-cyan-900/20 to-cyan-800/20 border border-cyan-500/20 hover:border-cyan-400/50 hover:from-cyan-500/10 hover:to-cyan-400/20 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] focus:outline-none transition-all duration-300 flex items-center justify-center cursor-pointer gap-2 w-full py-2.5 sm:py-3 mt-auto"
                    >
                      <span className="relative z-10 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-cyan-400 group-hover/btn:text-white transition-colors duration-300">
                        Access
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                    </button>
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
