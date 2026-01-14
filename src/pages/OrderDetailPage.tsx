'use client';

import { motion } from 'framer-motion';
import {
  Activity,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CornerDownRight,
  CreditCard,
  MapPin,
  Package,
  ShieldCheck,
  Sparkles,
  Truck,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { useNavigate, useParams } from 'react-router-dom';

// API & Data
import { fetchHybridRecommendations } from '@/api/recommend';
import ProductCard from '@/components/product/ProductCard';
import ProductDetailModal from '@/components/product/ProductDetailModal';

import { getProductById } from '@/data/products_indexed';
import type { Recommendation } from '@/types/recommendation';

// --- Types ---
interface OrderItemView {
  id: number;
  title: string;
  price: number;
  qty: number;
  image?: string;
  category?: string;
}

interface OrderDetail {
  id: string;
  orderNo?: string;
  date?: string;
  status?: string;
  items?: OrderItemView[];
  subtotal?: number;
  total?: number;
  shippingAddress?: string;
  paymentMethod?: string;
}

// --- Constants & Mock Data ---
const demoProductsRaw = [
  {
    id: 101,
    name: 'Demo Product A',
    price: 150,
    image: 'https://placehold.co/400',
  },
  {
    id: 102,
    name: 'Demo Product B',
    price: 200,
    image: 'https://placehold.co/400',
  },
  {
    id: 103,
    name: 'Demo Product C',
    price: 90,
    image: 'https://placehold.co/400',
  },
];
const CATEGORY_PRODUCTS: any[] = []; // 필요 시 실제 데이터로 채움
const TAX_RATE = 0.1;

// --- Helper Functions ---

// 1. 데모 주문 생성 헬퍼
const createDemoOrder = (id: string): OrderDetail => {
  const rawData = Array.isArray(demoProductsRaw) ? demoProductsRaw : [];

  const sourceItems =
    rawData.length > 0
      ? rawData.slice(0, 2)
      : [
          {
            id: 101,
            name: 'Demo Product A',
            price: 150,
            category: 'Electronics',
            image: '',
          },
          {
            id: 102,
            name: 'Demo Product B',
            price: 200,
            category: 'Apparel',
            image: '',
          },
        ];

  const demoItems = sourceItems.map((p: any) => ({
    id: Number(p.id || 999),
    title: p.name || p.title || 'Demo Item',
    price: Number(p.price || 100),
    qty: 1,
    image: p.image || '',
    category: p.category || 'General',
  }));

  return {
    id: id,
    orderNo: `DEMO-${id.split('-')[1] || '1234'}`,
    date: new Date().toLocaleString(),
    status: 'Processing',
    items: demoItems,
    subtotal: demoItems.reduce(
      (acc: number, cur: any) => acc + (cur.price ?? 0),
      0,
    ),
    total: demoItems.reduce((acc, cur) => acc + cur.price, 0) * 1.1,
    shippingAddress: 'Demo Address, Seoul, KR',
    paymentMethod: 'Test Card',
  };
};

// 2. 상품 메타데이터 조회
function lookupProductMeta(productId: number) {
  const idNum = Number(productId);
  if (!Number.isFinite(idNum)) return null;

  try {
    const idx = getProductById(idNum);
    if (idx) return idx;
  } catch (e) {}

  return CATEGORY_PRODUCTS.find((p) => Number(p.id) === idNum) || null;
}

// 3. 주문 아이템 정보 보강
function enrichItem(it: any): OrderItemView {
  const pid = Number(it?.productId ?? it?.product_id ?? it?.id) || 0;
  const meta = pid ? lookupProductMeta(pid) : null;
  const qty = Number(it?.qty ?? it?.quantity ?? 1) || 1;
  const price = Number(it?.price ?? meta?.price ?? 0) || 0;

  return {
    id: pid,
    title: meta?.name || it?.title || it?.name || `Product #${pid}`,
    price: price,
    qty: qty,
    image:
      meta?.image ||
      it?.image ||
      it?.imageUrl ||
      it?.img ||
      it?.thumbnail ||
      '',
    category: meta?.category || it?.category,
  };
}

// 4. 추천 사유 번역
const getTranslatedReason = (text: string) => {
  if (!text) return '';
  if (/^[\x00-\x7F]*$/.test(text)) return text;

  if (text.includes('콘텐츠')) return 'Content pattern match';
  if (text.includes('유사')) return 'Based on similarity';
  if (text.includes('대체')) return 'Alternative recommendation';
  if (text.includes('기본')) return 'Basic recommendation';
  if (text.includes('인기')) return 'Popular choice';
  if (text.includes('카테고리')) return 'Category match';

  return 'AI Suggested';
};

// --- Main Component ---
export default function OrderDetailPage() {
  // ✅ [수정] Hooks 선언 순서 정리 (최상단 배치)
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const idStr = orderId;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'STORE' | 'API' | null>(null);

  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [recsLoading, setRecsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  const sliderRef = useRef<HTMLDivElement | null>(null);

  const formatCurrency = (v: number | undefined) =>
    v !== undefined && v !== null ? v.toLocaleString() : '0';

  // API 호출 함수
  const fetchOrderFromApi = async (id: string) => {
    try {
      setLoading(true);
      // 실제 API 엔드포인트에 맞춰 수정 (/api/orders/...)
      const res = await fetch(`/api/orders/${id}`);

      if (!res.ok) throw new Error('주문을 불러올 수 없습니다.');

      const apiData = await res.json();

      const normalizedItems = apiData.items?.map((item: any) =>
        enrichItem(item),
      );

      setOrder({
        ...apiData,
        subtotal: apiData.totalAmount || apiData.subtotal || 0,
        total: (apiData.totalAmount || apiData.total || 0) * 1.1,
        items: normalizedItems,
      });

      setDataSource('API');
    } catch (err: any) {
      console.error('API 호출 실패:', err);
      // 실패 시 데모 데이터 로드
      const demo = createDemoOrder(id);
      setOrder(demo);
      setDataSource('STORE');
    } finally {
      setLoading(false);
    }
  };

  // Effect 1: 초기 진입 및 ID 변경 시 로직
  useEffect(() => {
    if (idStr) {
      fetchOrderFromApi(idStr);
    } else {
      setLoading(false);
      setError('Invalid Order ID');
    }
  }, [idStr]);

  // Effect 2: 주문(order) 로드 완료 시 추천 상품 로드
  useEffect(() => {
    if (!order?.items?.[0]) return;

    const seedId = Number(order.items[0].id);
    if (!Number.isFinite(seedId)) return;

    const loadRecs = async () => {
      setRecsLoading(true);
      try {
        const resp: any = await fetchHybridRecommendations(seedId, 4);

        let list: any[] =
          resp?.recommendations ??
          resp?.data ??
          (Array.isArray(resp) ? resp : []);

        if (!list || list.length === 0) {
          setRecs([]);
        }

        const normalized: Recommendation[] = list
          .map((it: any): Recommendation | null => {
            if (!it) return null;

            if (it.id && (it.name || it.title)) {
              return {
                id: it.id,
                name: it.name ?? it.title,
                title: it.title ?? it.name,
                price: Number(it.price ?? 0),
                image: it.image ?? '',
                why: getTranslatedReason(it.why) || 'AI Suggested',
                confidence: it.confidence || 0,
              } as Recommendation;
            }

            if (typeof it === 'number' || typeof it === 'string') {
              const meta = getProductById(Number(it));
              if (!meta) return null;
              return {
                ...meta,
                why: 'ID recall',
                confidence: 0.2,
              } as Recommendation;
            }

            return null;
          })
          .filter((item): item is Recommendation => item !== null);

        setRecs(normalized);
      } catch (e) {
        console.warn('Failed to load recommendations (using fallback)', e);
        const fallbackList = (demoProductsRaw as any[]).slice(0, 4);
        const fallbackRecs = fallbackList.map((it) => ({
          ...it,
          title: it.name,
          why: 'Demo Fallback',
          confidence: 0,
        }));
        setRecs(fallbackRecs as any);
      } finally {
        setRecsLoading(false);
      }
    };

    loadRecs();
  }, [order]);

  const scrollRecs = (dir: 'left' | 'right') => {
    if (!sliderRef.current) return;
    const distance = sliderRef.current.clientWidth * 0.6;
    sliderRef.current.scrollBy({
      left: dir === 'left' ? -distance : distance,
      behavior: 'smooth',
    });
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  // --- Render Steps (Early Returns) ---

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="p-10 text-center text-cyan-400 animate-pulse">
          Loading Order Details...
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="p-10 text-center text-red-400">
          {error || 'Order Not Found'}
          <button
            onClick={() => navigate(-1)}
            className="block mt-4 text-sm text-slate-500 underline"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // --- Main Render ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[url('/circuit-board.svg')] bg-center opacity-5 mix-blend-screen pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="group mb-8 flex items-center gap-3 text-slate-500 hover:text-cyan-400 transition-colors w-fit"
        >
          <div className="pointer-events-auto p-3 bg-white/5 backdrop-blur-sm border border-white/10 text-cyan-400 rounded-full hover:bg-cyan-500/20 hover:text-cyan-300 hover:border-cyan-500/30 transition-all group shadow-lg cursor-pointer">
            <ArrowLeft size={20} />
          </div>
        </button>

        {/* --- Header Section --- */}
        <motion.header
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
        >
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span
                className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-widest border ${dataSource === 'STORE' ? 'bg-emerald-950/50 border-emerald-500/30 text-emerald-400' : 'bg-cyan-950/50 border-cyan-500/30 text-cyan-400'}`}
              >
                {dataSource === 'STORE' ? ' Local Cache' : ' Network Fetch'}
              </span>
              <span className="text-slate-500 text-xs font-mono uppercase tracking-widest flex items-center gap-2">
                <Calendar size={12} /> {order.date}
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white italic uppercase tracking-tighter">
              Order <span className="text-slate-600">#</span>
              {order.id}
            </h1>
          </div>

          <div className="text-right md:text-left">
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">
              Current Status
            </div>
            <div
              className={`flex items-center justify-end md:justify-start gap-2 text-lg font-bold uppercase italic tracking-tight ${order.status === 'Delivered' ? 'text-emerald-400' : 'text-cyan-400'}`}
            >
              {order.status === 'Delivered' ? (
                <CheckCircle2 size={20} />
              ) : (
                <Truck size={20} />
              )}
              {order.status}
            </div>
          </div>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start pb-6">
          {/* Left Column: Items */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="flex items-center gap-2 border-b border-white/10 pb-4">
              <Package className="text-cyan-500" size={20} />
              <h2 className="text-xl font-black uppercase italic tracking-tight text-white">
                Manifest // Items
              </h2>
            </div>

            <div className="space-y-4">
              {order.items?.map((item, idx) => (
                <div
                  key={`order-item-${item.id}-${idx}`}
                  className="group relative bg-slate-900/40 border border-white/5 rounded-[1.5rem] sm:rounded-[2rem] transition-all duration-500 hover:border-cyan-500/50 hover:bg-slate-900/60 hover:shadow-[0_0_40px_rgba(6,182,212,0.1)] w-full flex flex-col sm:flex-row p-3 sm:p-5 gap-4 sm:gap-6 items-stretch sm:items-center"
                >
                  <div className="w-full sm:w-28 aspect-square rounded-2xl bg-slate-900 overflow-hidden border border-white/5 relative shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500 text-xs">
                        NO IMG
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <h3 className="text-lg font-bold text-white uppercase italic tracking-tight mb-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-mono">
                        SKU: {item.id} <span className="mx-2">|</span>{' '}
                        {item.category || 'General'}
                      </p>
                    </div>
                    <div className="flex justify-between items-end mt-4 sm:mt-0">
                      <div className="text-xs font-mono bg-white/5 px-3 py-1.5 rounded-lg text-slate-300 border border-white/5">
                        QTY: {item.qty}
                      </div>
                      <div className="text-xl font-black text-white">
                        <span className="text-sm font-light text-cyan-500 mr-1">
                          $
                        </span>
                        {formatCurrency(item.price * item.qty)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column: Transaction Info */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="border border-cyan-500/20 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.05)]">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
              <h3 className="text-lg font-black text-white uppercase italic tracking-tight mb-6 flex items-center gap-2">
                <ShieldCheck className="text-cyan-500" size={18} /> Transaction
                Data
              </h3>

              <div className="space-y-3 mb-6 font-mono text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>SUBTOTAL</span>
                  <span>${formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>TAX ESTIMATE</span>
                  <span>
                    {' '}
                    ${formatCurrency((order.subtotal || 0) * TAX_RATE)}
                  </span>
                </div>
                <div className="h-px bg-white/10 my-2" />
                <div className="flex justify-between text-white font-bold text-lg items-baseline">
                  <span className="tracking-widest text-xs uppercase text-cyan-500">
                    Total
                  </span>
                  <span>${formatCurrency(order.total)}</span>
                </div>
              </div>

              <div className="p-3 bg-cyan-950/20 border border-cyan-500/10 rounded-xl flex items-center gap-3">
                <CreditCard className="text-cyan-400" size={16} />
                <span className="text-xs text-cyan-100 font-mono tracking-wide">
                  {order.paymentMethod}
                </span>
              </div>
            </div>

            <div className="border border-white/5 rounded-3xl p-6 sm:p-8 relative bg-white/[0.02]">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <MapPin size={14} /> Destination
              </h3>
              <p className="text-white font-medium leading-relaxed">
                {order.shippingAddress}
              </p>

              <div className="mt-6">
                <button
                  className="
relative group/btn overflow-hidden rounded-xl z-10
w-full sm:w-auto px-6 py-3 flex items-center justify-center
bg-gradient-to-r from-cyan-950/40 to-cyan-900/20
border border-cyan-500/20
hover:border-cyan-400/50 hover:from-cyan-500/10 hover:to-cyan-400/20
hover:shadow-[0_0_25px_-5px_rgba(6,182,212,0.4)]
transition-all duration-300 ease-out cursor-pointer active:scale-95
"
                >
                  <span
                    className="
relative z-10 flex items-center gap-2
text-xs font-black uppercase tracking-[0.2em] 
text-cyan-400 group-hover/btn:text-cyan-100 
transition-colors duration-300 pt-0.5
"
                  >
                    Track Delivery
                  </span>

                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] pointer-events-none" />

                  <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-hover/btn:opacity-100 blur-[2px] transition-opacity duration-300" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recommendations Section */}
        <motion.section
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
          className="pt-8 border-t border-white/5"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <h2 className="text-xl sm:text-2xl font-black uppercase italic flex items-center gap-3 tracking-tight text-white">
                <Sparkles
                  className="text-cyan-400"
                  fill="currentColor"
                  size={20}
                />{' '}
                Neural Recommendations
              </h2>
              <div className="self-start sm:self-auto px-3 py-1 flex items-center gap-2">
                <Activity
                  size={12}
                  className="animate-pulse text-emerald-500"
                />
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
                  System Optimized
                </span>
              </div>
            </div>

            <div className="flex gap-4 self-end sm:self-auto">
              <button
                onClick={() => scrollRecs('left')}
                className="p-2 rounded-full border border-white/10 bg-white/5 text-cyan-400 hover:bg-cyan-500 hover:text-black hover:border-cyan-400 transition-all duration-300"
                aria-label="Scroll Left"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={() => scrollRecs('right')}
                className="p-2 rounded-full border border-white/10 bg-white/5 text-cyan-400 hover:bg-cyan-500 hover:text-black hover:border-cyan-400 transition-all duration-300"
                aria-label="Scroll Right"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>

          <div
            ref={sliderRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto overflow-y-hidden p-4 sm:p-6 snap-x scroll-smooth no-scrollbar"
          >
            {recsLoading
              ? [1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={`skeleton-${i}`}
                    className="min-w-[220px] sm:min-w-[260px] aspect-[3/4] bg-white/5 rounded-[1.25rem] animate-pulse border border-white/5 snap-center"
                  />
                ))
              : recs.map((product, idx) => (
                  <div
                    key={`rec-${product.id || 'no-id'}-${idx}`}
                    className="group min-w-[220px] sm:min-w-[260px] snap-center h-full flex flex-col gap-3"
                  >
                    <ProductCard
                      product={product}
                      onOpen={() => setSelectedProduct(product)}
                    />
                    {product.why && (
                      <div className="sm:hidden relative pl-4 pr-2 py-1 ml-2 mt-[-8px]">
                        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-cyan-500/50 via-cyan-500/10 to-transparent group-hover:from-cyan-400 group-hover:via-cyan-400/30 transition-colors duration-300" />
                        <div className="absolute left-[-2px] top-0 w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)] group-hover:scale-125 transition-transform duration-300" />
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5">
                            <CornerDownRight
                              size={12}
                              className="text-cyan-600 group-hover:text-cyan-400 transition-colors duration-300"
                            />
                            <span className="text-[8px] font-black uppercase tracking-widest text-cyan-700 group-hover:text-cyan-400 transition-colors duration-300">
                              Analysis_Log
                            </span>
                          </div>
                          <p className="text-[10px] font-mono text-slate-500 leading-tight group-hover:text-cyan-100/90 transition-colors duration-300">
                            <span className="text-cyan-600/50 mr-1 group-hover:text-cyan-400 transition-colors">
                              &gt;&gt;
                            </span>
                            {product.why}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
          </div>
        </motion.section>

        {selectedProduct &&
          createPortal(
            <ProductDetailModal
              product={selectedProduct}
              onClose={() => setSelectedProduct(null)}
            />,
            document.body,
          )}
      </div>
    </div>
  );
}
