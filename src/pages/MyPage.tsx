// src/pages/MyPage.tsx
'use client';

import { fetchHybridRecommendations } from '@/api/recommend';
import useOrderStore from '@/store/orderStore';
import { useUserStore } from '@/store/userStore';
import type { Product } from '@/types';
import { motion } from 'framer-motion';
import { useEffect, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
// 컴포넌트 임포트
import ProductCard from '@/components/product/ProductCard';
import ProductDetailModal from '@/components/product/ProductDetailModal';
import { getProductById } from '@/data/products_indexed';

// 아이콘 임포트
import {
  Activity,
  ChevronRight,
  ExternalLink,
  History,
  Package,
  Settings,
  Sparkles,
  UserCircle2,
} from 'lucide-react';

interface MyPageProps {
  currentUser: {
    id?: string | number;
    name: string;
    email: string;
    phone?: string;
  };
}

export default function MyPage({ currentUser }: MyPageProps) {
  const navigate = useNavigate();
  const { orders } = useUserStore();
  const [recs, setRecs] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // selector 방식으로 액션만 가져와 리렌더 최소화
  const setOrder = useOrderStore((s) => s.setOrder);

  // 🛡️ 방어 코드
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-cyan-500 gap-4">
        <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <span className="font-mono text-xs tracking-[0.2em] animate-pulse">
          INITIALIZING NEURAL LINK...
        </span>
      </div>
    );
  }

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

  // replace existing syncOrderFeedback with this
  const syncOrderFeedback = async (orderId: string | number) => {
    const ensureNumber = (val: any) => {
      if (val === null || val === undefined) return null;
      const num = Number(val);
      return !isNaN(num) && Number.isFinite(num) ? num : val;
    };

    const userId = ensureNumber(currentUser?.id);
    const safeOrderId = ensureNumber(orderId);

    if (!userId || !safeOrderId) {
      console.warn(
        'syncOrderFeedback 중단: user_id 또는 order_id가 유효하지 않습니다.',
        { userId, safeOrderId },
      );
      return { ok: false };
    }

    const payload = {
      action: 'view_details',
      sent_at: new Date().toISOString(),
      user_id: userId,
      order_id: safeOrderId,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        try {
          const errJson = JSON.parse(errText);
          console.error(`AI 피드백 실패 (${res.status}):`, errJson);
        } catch {
          console.error(`AI 피드백 실패 (${res.status}):`, errText);
        }
        return { ok: false, status: res.status };
      }

      const data = await res.json();
      console.log('AI 피드백 성공:', data);
      return { ok: true, data };
    } catch (error) {
      console.error('AI 피드백 네트워크 오류:', error);
      return { ok: false };
    }
  };

  // 안전한 정규화(간단)
  const normalizeOrderForStore = (rawOrder: any) => {
    const normalizedItems = Array.isArray(rawOrder?.items)
      ? rawOrder.items.map((it: any) => ({
          productId: it.productId ?? it.product_id ?? it.id,
          qty: it.qty ?? it.quantity ?? 1,
          price: it.price ?? it.unitPrice ?? it.amount ?? 0,
          title: it.title ?? it.name ?? '',
          image: it.image ?? it.img ?? '',
        }))
      : [];

    const computedSubtotal = normalizedItems.length
      ? normalizedItems.reduce(
          (s: number, it: any) =>
            s + (Number(it.price) || 0) * (Number(it.qty) || 0),
          0,
        )
      : 0;

    return {
      ...rawOrder,
      id: rawOrder.id ?? rawOrder.orderId ?? rawOrder.order_id,
      items: normalizedItems,
      // Prefer explicit subtotal/shipping fields when available, otherwise compute subtotal from items.
      // Include `total` as a pragmatic fallback for locally-created orders that only set `total`.
      subtotal:
        rawOrder.subtotal ??
        rawOrder.sub_total ??
        rawOrder.total ??
        (normalizedItems.length ? computedSubtotal : null),
      // Default shippingCost to 0 (FREE) if not provided for UX reasons
      shippingCost:
        rawOrder.shippingCost ??
        rawOrder.shipping_cost ??
        rawOrder.shipping ??
        rawOrder.shippingFee ??
        0,
      total: rawOrder.total ?? rawOrder.amount ?? null,
      status: rawOrder.status ?? null,
    };
  };

  // when user clicks Details: returns handler to avoid inline closures recreation
  const onDetailsClick = (order: any) => async (e: MouseEvent) => {
    e.preventDefault();

    if (!order || !order.id) {
      console.error('주문 상세 보기 실패: Order ID가 없습니다.');
      return;
    }

    // normalize minimal fields (store also normalizes but do light prep here)
    let normalized = normalizeOrderForStore(order);

    // Enrich normalized items using local index (helps OrderDetailPage render images/title/price immediately)
    try {
      normalized.items = (normalized.items || []).map((it: any) => {
        const pid = Number(it.productId ?? it.product_id ?? it.id) || 0;
        const meta = pid ? getProductById(pid) : null;
        return {
          ...it,
          productId: pid,
          qty: Number(it.qty ?? it.quantity ?? 1) || 1,
          price: Number(it.price ?? meta?.price ?? 0) || 0,
          title: it.title || meta?.name || `Product ${pid}`,
          // prefer catalog metadata, but fall back to raw item image (guard against empty strings)
          image:
            meta?.image && String(meta.image).trim()
              ? meta.image
              : it.image || '',
        };
      });

      // recalc subtotal if missing
      if (normalized.subtotal == null) {
        normalized.subtotal = normalized.items.reduce(
          (s: number, it: any) =>
            s + (Number(it.price) || 0) * (Number(it.qty) || 0),
          0,
        );
      }
    } catch (e) {
      console.warn('local enrichment failed (non-fatal):', e);
    }

    // set into zustand store (store will persist/normalize further)
    try {
      setOrder(normalized);
    } catch (err) {
      console.warn('setOrder 실패', err);
    }

    // async feedback, don't block navigation
    syncOrderFeedback(order.id).catch((err) =>
      console.warn('syncOrderFeedback error:', err),
    );

    // If the normalized order lacks items or subtotal/shipping, try fetching full order details
    // BUT avoid calling the backend with non-numeric order identifiers (e.g. locally-created "ORD-..." ids)
    let finalOrder = normalized;
    const needsFetchForDetails =
      !Array.isArray(normalized.items) ||
      normalized.items.length === 0 ||
      normalized.subtotal == null ||
      normalized.shippingCost == null;

    const orderIdLooksNumeric = /^\d+$/.test(String(order.id));

    if (needsFetchForDetails && orderIdLooksNumeric) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/orders/${order.id}`);
        if (res.ok) {
          const json = await res.json();
          const fetchedNormalized = normalizeOrderForStore(json);
          finalOrder = fetchedNormalized;
          try {
            setOrder(fetchedNormalized);
          } catch (err) {
            console.warn('setOrder (fetched) 실패', err);
          }
        } else {
          console.warn(`Order fetch failed with status ${res.status}`);
        }
      } catch (err) {
        console.warn('Order fetch network error:', err);
      }
    } else if (needsFetchForDetails && !orderIdLooksNumeric) {
      // local order (e.g. ORD-...) — don't attempt GET /api/orders/:id (backend expects numeric id)
      console.info(
        'Skipping backend fetch for non-numeric order id; using local order data instead.',
      );
    }

    // navigate using store and route state (send final order so OrderDetailPage can use it immediately)
    try {
      console.debug('onDetailsClick: navigating with finalOrder', {
        id: order.id,
        itemsPreview: Array.isArray(finalOrder?.items)
          ? finalOrder.items.slice(0, 5)
          : finalOrder?.items,
      });
    } catch (e) {
      /* ignore logging errors */
    }

    navigate(`/orders/${order.id}`, { state: { order: finalOrder } });
  };

  useEffect(() => {
    const loadRecs = async () => {
      setLoading(true);
      try {
        const seedId =
          orders &&
          orders.length > 0 &&
          orders[0].items &&
          orders[0].items.length > 0
            ? orders[0].items[0].productId
            : 1;
        const data = await fetchHybridRecommendations(seedId, 4);
        const products = Array.isArray(data)
          ? data
          : data?.recommendations || [];
        setRecs(products);
      } catch (error) {
        console.error('Failed to load recommendations:', error);
        setRecs([]);
      } finally {
        setLoading(false);
      }
    };
    loadRecs();
  }, [orders]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen text-slate-200 selection:bg-cyan-500/30 relative font-sans bg-slate-950 overflow-hidden">
      <div className="fixed inset-0 bg-[url('/circuit-board.svg')] bg-center opacity-5 mix-blend-screen pointer-events-none z-0" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-14 relative z-10 space-y-12 sm:space-y-16"
      >
        <motion.header
          variants={itemVariants}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div className="flex items-start gap-4 sm:gap-6">
            <div className="relative group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.1)] group-hover:shadow-[0_0_50px_rgba(6,182,212,0.2)] transition-all duration-500">
                <span className="text-3xl sm:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-tr from-cyan-400 to-white">
                  {currentUser.name[0]}
                </span>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-slate-950 p-1 rounded-full border border-white/10">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-cyan-400 text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded-md flex items-center gap-2">
                  <UserCircle2 size={12} /> Citizen ID: {currentUser.id}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-white italic tracking-tighter uppercase leading-[0.9]">
                {currentUser.name}
              </h1>

              <p className="text-slate-500 font-mono text-[10px] sm:text-xs uppercase tracking-widest mt-2 pl-1 flex items-center gap-2">
                {currentUser.email}
              </p>
            </div>
          </div>

          <div className="flex gap-4 w-full md:w-auto justify-end">
            <button className="p-3 sm:p-4 bg-white/5 rounded-xl hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-400 transition-all border border-white/5 group">
              <Settings
                size={20}
                className="text-slate-400 group-hover:text-cyan-400 group-hover:rotate-90 transition-transform duration-500"
              />
            </button>
          </div>
        </motion.header>

        <motion.section
          variants={itemVariants}
          className="space-y-0 sm:space-y-0"
        >
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <Package className="text-cyan-500" size={24} />
            <h2 className="text-xl sm:text-2xl font-black uppercase italic tracking-tight text-white">
              Recent Operations
            </h2>
            <span className="ml-auto text-[10px] font-mono text-slate-500 uppercase tracking-widest hidden sm:block">
              // Transaction History
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {orders && orders.length === 0 ? (
              <div className="p-16 text-center bg-white/5 rounded-[2rem] border border-dashed border-white/10 flex flex-col items-center gap-4">
                <History className="text-slate-700" size={48} />
                <p className="text-slate-500 font-black uppercase tracking-widest text-sm">
                  No transaction data found.
                </p>
              </div>
            ) : (
              orders?.map((order: any) => (
                <div
                  key={order.id}
                  className="group relative bg-white/[0.02] border border-white/5 p-5 sm:p-6 rounded-[1.5rem] hover:border-cyan-500/30 hover:bg-white/[0.04] transition-all duration-300 flex flex-col sm:flex-row justify-between sm:items-center gap-6 overflow-hidden"
                >
                  <div className="flex items-start sm:items-center gap-5 sm:gap-8 z-10">
                    <div className="p-3 sm:p-4 border border-white/10 rounded-xl group-hover:border-cyan-500/20 transition-colors">
                      <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">
                        Order ID
                      </div>
                      <div className="font-mono text-cyan-400 font-bold text-sm sm:text-base tracking-wider">
                        #{String(order.id).slice(0, 8)}
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-light text-cyan-500">
                          $
                        </span>
                        <span className="text-lg sm:text-2xl font-black text-white italic tracking-tight">
                          {Number(order.total ?? 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={onDetailsClick(order)}
                    className="
                      relative overflow-hidden rounded-xl font-bold uppercase tracking-widest transition-all duration-300
                      bg-white/5 border border-white/10 text-slate-200
                      hover:bg-cyan-500 hover:text-black hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]
                      group/btn flex items-center justify-center cursor-pointer w-full sm:w-auto px-6 py-3 text-xs z-10
                    "
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Details{' '}
                      <ChevronRight
                        size={14}
                        className="group-hover/btn:translate-x-1 transition-transform"
                      />
                    </span>
                  </button>

                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </div>
              ))
            )}
          </div>
        </motion.section>

        <motion.section
          variants={itemVariants}
          className="pt-8 border-t border-white/5"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl sm:text-2xl font-black uppercase italic flex items-center gap-3 tracking-tight text-white">
              <Sparkles
                className="text-cyan-400"
                fill="currentColor"
                size={20}
              />{' '}
              Neural Recommendations
            </h2>
            <div className="hidden sm:block text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Activity size={12} className="animate-pulse text-emerald-500" />
              System Optimized
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {loading
              ? [1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="aspect-[3/4] bg-white/5 rounded-[1.5rem] animate-pulse border border-white/5"
                  />
                ))
              : recs.map((product) => (
                  <div key={product.id} className="flex flex-col gap-3 group">
                    <div className="relative h-full">
                      <ProductCard
                        product={product}
                        onOpen={(p: Product) => setSelectedProduct(p)}
                      />
                    </div>

                    {product.why && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="px-3 py-2 bg-slate-900/80 border border-cyan-500/20 rounded-lg flex items-start gap-2 backdrop-blur-md"
                      >
                        <ExternalLink
                          size={10}
                          className="text-cyan-500 mt-0.5 shrink-0"
                        />
                        <p className="text-[9px] text-cyan-100 font-mono uppercase leading-tight line-clamp-2">
                          <span className="text-cyan-400 font-bold mr-1">
                            AI_REASON:
                          </span>
                          {product.why}
                        </p>
                      </motion.div>
                    )}
                  </div>
                ))}
          </div>
        </motion.section>
      </motion.div>

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
