'use client';

import { motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  MapPin,
  Package,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Truck,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
// Global State
import { useUserStore } from '@/store/userStore';

// API & Data
import { fetchHybridRecommendations } from '@/api/recommend';
import ProductCard from '@/components/product/ProductCard';
import ProductDetailModal from '@/components/product/ProductDetailModal';
import { CATEGORY_PRODUCTS } from '@/data/categoryData';
import demoProductsRaw from '@/data/demo_products_500.json';
import { getProductById } from '@/data/products_indexed';
import type { Recommendation } from '@/types/recommendation';

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

const TAX_RATE = 0.1;
const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8000';

function lookupProductMeta(productId: number) {
  const idNum = Number(productId);
  if (!Number.isFinite(idNum)) return null;

  try {
    const idx = getProductById(idNum);
    if (idx) return idx;
  } catch (e) {
    /* ignore */
  }

  const cat = CATEGORY_PRODUCTS.find((p) => Number(p.id) === idNum);
  if (cat) return cat;

  const demo = (demoProductsRaw as any[]).find((p) => Number(p.id) === idNum);
  if (demo) return demo;

  return null;
}

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
    image: meta?.image || it?.image || it?.img || '',
    category: meta?.category || it?.category,
  };
}

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Store access
  const { getCurrentUser } = useUserStore();

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

  useEffect(() => {
    if (!orderId) return;

    setLoading(true);
    setError(null);

    // 1. Check Navigation State (Passed from MyPage)
    const stateOrder = location.state?.order;

    if (stateOrder && String(stateOrder.id) === String(orderId)) {
      console.log(
        `🚀 [Nav State] Loaded Order #${orderId} from Location State.`,
      );

      const enrichedItems = (stateOrder.items || []).map(enrichItem);

      const mappedOrder: OrderDetail = {
        id: String(stateOrder.id),
        date: stateOrder.date
          ? new Date(stateOrder.date).toLocaleString()
          : new Date().toLocaleString(),
        status: stateOrder.status,
        items: enrichedItems,
        subtotal: stateOrder.total,
        total: stateOrder.total,
        shippingAddress:
          getCurrentUser()?.profile?.addresses?.[0] || 'Seoul, Korea (Default)',
        paymentMethod: 'Credit Card (**** 1234)',
      };

      setOrder(mappedOrder);
      setDataSource('STORE');
      setLoading(false);
      return; // Exit early if found in state
    }

    // 2. Check User Store Cache
    const user = getCurrentUser();
    const cachedOrder = user?.orders?.find(
      (o: any) => String(o.id) === String(orderId),
    );

    if (cachedOrder) {
      console.log(`⚡ [Cache Hit] Loaded Order #${orderId} from User Store.`);
      const enrichedItems = (cachedOrder.items || []).map(enrichItem);
      const mappedOrder: OrderDetail = {
        id: String(cachedOrder.id),
        date: cachedOrder.date
          ? new Date(cachedOrder.date).toLocaleString()
          : new Date().toLocaleString(),
        status: cachedOrder.status,
        items: enrichedItems,
        subtotal: (cachedOrder as any).subtotal ?? cachedOrder.total,
        total: cachedOrder.total,
        shippingAddress:
          user?.profile?.addresses?.[0] || 'Seoul, Korea (Default)',
        paymentMethod: 'Credit Card (**** 1234)',
      };
      setOrder(mappedOrder);
      setDataSource('STORE');
      setLoading(false);
    } else {
      // 3. Fallback to API Fetch
      console.warn(
        `📡 [Cache Miss] Order #${orderId} not found. Fetching API...`,
      );
      fetchOrderFromApi(String(orderId));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, getCurrentUser, location.state]);

  const fetchOrderFromApi = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${id}`);
      if (!res.ok) throw new Error(`API Error: ${res.status}`);

      const apiData = await res.json();
      const enrichedItems = (apiData.items || []).map(enrichItem);
      const subtotal = enrichedItems.reduce(
        (acc: number, cur: any) => acc + cur.price * cur.qty,
        0,
      );

      const mappedOrder: OrderDetail = {
        id: String(apiData.id),
        orderNo: apiData.orderNo,
        date: apiData.createdAt
          ? new Date(apiData.createdAt).toLocaleString()
          : new Date().toLocaleString(),
        status: apiData.status,
        items: enrichedItems,
        subtotal: subtotal,
        total: apiData.totalAmount ?? apiData.total,
        shippingAddress: apiData.shippingAddress || 'Gangnam-gu, Seoul, KR',
        paymentMethod: apiData.paymentMethod || 'Credit Card',
      };

      setOrder(mappedOrder);
      setDataSource('API');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!order?.items?.[0]) return;

    const seedId = Number(order.items[0].id);
    if (!Number.isFinite(seedId)) return;

    const loadRecs = async () => {
      setRecsLoading(true);
      try {
        const resp: any = await fetchHybridRecommendations(seedId, 4);
        console.debug('OrderDetail recs raw:', resp);
        let list: any[] =
          resp?.recommendations ??
          resp?.data ??
          (Array.isArray(resp) ? resp : []);
        if (!list || list.length === 0) {
          list = (demoProductsRaw as any[]).slice(0, 4) || [];
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
                why: it.why ?? null,
                confidence: it.confidence,
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
        console.error('Failed to load recommendations (OrderDetail)', e);
        setRecs((demoProductsRaw as any[]).slice(0, 4) ?? []);
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

        {loading && (
          <div className="animate-pulse space-y-12">
            <div className="flex justify-between items-end">
              <div className="space-y-4">
                <div className="w-32 h-6 bg-slate-900/80 rounded-lg" />
                <div className="w-64 h-12 bg-slate-900/80 rounded-xl" />
              </div>
            </div>
            <div className="h-64 bg-slate-900/50 rounded-3xl" />
          </div>
        )}

        {error && !loading && (
          <div className="rounded-2xl bg-rose-500/5 border border-rose-500/20 p-8 text-center flex flex-col items-center">
            <AlertTriangle className="text-rose-500 mb-4" size={40} />
            <h2 className="text-xl font-bold text-rose-300 mb-2">
              System Error
            </h2>
            <p className="text-sm text-slate-300 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-xs font-bold uppercase"
            >
              <RefreshCw size={14} /> Retry Connection
            </button>
          </div>
        )}

        {order && !loading && (
          <div>
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <motion.div
                variants={itemVariants}
                className="lg:col-span-2 space-y-6"
              >
                <div className="flex items-center gap-2 border-b border-white/10 pb-4">
                  <Package className="text-cyan-500" size={20} />
                  <h2 className="text-xl font-black uppercase italic tracking-tight text-white">
                    Manifest // Items
                  </h2>
                </div>

                <div className="space-y-4">
                  {order.items?.map((item) => (
                    <div
                      key={item.id}
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

              <motion.div variants={itemVariants} className="space-y-6">
                <div className="border border-cyan-500/20 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.05)]">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
                  <h3 className="text-lg font-black text-white uppercase italic tracking-tight mb-6 flex items-center gap-2">
                    <ShieldCheck className="text-cyan-500" size={18} />{' '}
                    Transaction Data
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
    /* 레이아웃 & 크기 */
    w-full sm:w-auto px-6 py-3 flex items-center justify-center
    
    /* 1. 배경 & 테두리: 어두운 투명 패널 + Cyan 틴트 */
    bg-gradient-to-r from-cyan-950/40 to-cyan-900/20
    border border-cyan-500/20
    
    /* 2. 호버 효과: 밝기 증가 + 그림자 글로우 */
    hover:border-cyan-400/50 hover:from-cyan-500/10 hover:to-cyan-400/20
    hover:shadow-[0_0_25px_-5px_rgba(6,182,212,0.4)]
    
    /* 애니메이션 기본 설정 */
    transition-all duration-300 ease-out cursor-pointer active:scale-95
  "
                    >
                      {/* 텍스트 컨텐츠 */}
                      <span
                        className="
    relative z-10 flex items-center gap-2
    text-xs font-black uppercase tracking-[0.2em] 
    text-cyan-400 group-hover/btn:text-cyan-100 
    transition-colors duration-300 pt-0.5
  "
                      >
                        {/* (선택사항) 아이콘을 넣는다면 여기에: <Scan size={14} /> */}
                        Track Delivery
                      </span>

                      {/* 3. 배경 스캔 애니메이션: 추적 중임을 암시하는 빛의 흐름 */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] pointer-events-none" />

                      {/* 4. 하단 레이저 인디케이터 */}
                      <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-hover/btn:opacity-100 blur-[2px] transition-opacity duration-300" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.section
              variants={itemVariants}
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
                className="flex gap-4 sm:gap-6 overflow-hidden pb-6 snap-x scroll-smooth"
              >
                {recsLoading
                  ? [1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={i}
                        className="min-w-[280px] sm:min-w-[320px] aspect-[3/4] bg-white/5 rounded-[1.5rem] animate-pulse border border-white/5 snap-center"
                      />
                    ))
                  : recs.map((product) => (
                      <div
                        key={product.id}
                        className="min-w-[280px] sm:min-w-[320px] snap-center h-full"
                      >
                        <ProductCard
                          product={product}
                          onOpen={() => setSelectedProduct(product)}
                        />
                      </div>
                    ))}
              </div>
            </motion.section>
          </div>
        )}

        {selectedProduct &&
          createPortal(
            <ProductDetailModal
              product={selectedProduct}
              onClose={() => setSelectedProduct(null)}
            />,
            document.body, // 모달을 현재 컴포넌트가 아닌 body 태그 바로 아래에 렌더링
          )}
      </div>
    </div>
  );
}
