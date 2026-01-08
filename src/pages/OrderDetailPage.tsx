// src/pages/OrderDetailPage.tsx
'use client';

import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  CreditCard,
  MapPin,
  Package,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

// NOTE: adjust these import paths if your project places these files elsewhere
import { CATEGORY_PRODUCTS } from '@/data/categoryData';
import demoProductsRaw from '@/data/demo_products_500.json';
import { getProductById } from '@/data/products_indexed';
import useOrderStore from '@/store/orderStore';

/** UI에서 사용하는 주문 아이템 타입 (통일된 뷰 모델) */
interface OrderItemView {
  id: number; // product id
  title: string;
  price: number;
  qty: number;
  image?: string;
  category?: string;
}

/** 주문 상세 뷰 모델 */
interface OrderDetail {
  id: string;
  date?: string;
  status?: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | string;
  items?: OrderItemView[] | undefined;
  subtotal?: number | null;
  shippingCost?: number | null;
  total?: number | null;
  shippingAddress?: string;
  paymentMethod?: string;
}

/** 개발용 모의 데이터 (필요시 제거) */
const MOCK_ORDERS: Record<string, OrderDetail> = {
  '1': {
    id: '1',
    date: '2024.05.21 14:30:22',
    status: 'Delivered',
    items: [
      {
        id: 101,
        title: 'NEURAL INTERFACE V2',
        price: 1250,
        qty: 1,
        image:
          'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=200',
      },
      {
        id: 102,
        title: 'QUANTUM PROCESSOR CORE',
        price: 800,
        qty: 2,
        image:
          'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=200',
      },
    ],
    subtotal: 2850,
    shippingCost: 0,
    total: 2850,
    shippingAddress: 'Sector 7G, Cyber District, Neo-Seoul, KR',
    paymentMethod: 'Credits (****-1024)',
  },
  '2': {
    id: '2',
    date: '2024.06.02 09:12:05',
    status: 'Shipped',
    items: [
      {
        id: 201,
        title: 'AERO GLIDE MODULE',
        price: 450,
        qty: 1,
        image:
          'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?auto=format&fit=crop&q=80&w=200',
      },
      {
        id: 202,
        title: 'PLASMA BATTERY PACK',
        price: 230,
        qty: 3,
        image:
          'https://images.unsplash.com/photo-1555685812-4b943f1a9b50?auto=format&fit=crop&q=80&w=200',
      },
    ],
    subtotal: 1140,
    shippingCost: 25,
    total: 1165,
    shippingAddress: 'Hangang-ro, Mapo-gu, Seoul, KR',
    paymentMethod: 'Card (****-3321)',
  },
};

const TAX_RATE = 0.1; // 10%

/** 로컬 카탈로그에서 메타 조회 (안전하게 null 반환) */
function lookupProductMeta(productId: number) {
  const idNum = Number(productId);
  if (!Number.isFinite(idNum)) return null;

  // 1. Prefer the combined/indexed list which includes demo products
  try {
    const idx = getProductById(idNum);
    if (idx) return idx; // 찾았으면 바로 리턴
  } catch (e) {
    /* ignore */
  }

  // 2. Check CATEGORY_PRODUCTS
  if (Array.isArray(CATEGORY_PRODUCTS)) {
    const cat = CATEGORY_PRODUCTS.find((p) => Number(p.id) === idNum);
    if (cat) return cat; // 찾았으면 바로 리턴
  }

  // ▼▼▼▼▼ 3. Check demo_products_500.json (새로 추가) ▼▼▼▼▼
  if (Array.isArray(demoProductsRaw)) {
    // any 타입으로 변환하여 id 비교 (타입 에러 방지)
    const demo = (demoProductsRaw as any[]).find((p) => Number(p.id) === idNum);
    if (demo) {
      console.debug('lookupProductMeta: found in demo_products_500', {
        id: idNum,
      });
      return demo;
    }
  }
  // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

  // 못 찾았을 경우 로그
  try {
    console.debug('lookupProductMeta: not found everywhere', { id: idNum });
  } catch (e) {
    /* ignore */
  }

  return null;
}

/**
 * Normalize/enrich a raw order item into the OrderItemView used by the UI.
 * Ensures consistent title/image/price overrides and uses the local catalog as the primary source,
 * falling back to the raw item fields when catalog metadata is missing or empty.
 */
function enrichItem(it: any): OrderItemView {
  const pid = Number(it?.productId ?? it?.product_id ?? it?.id) || 0;
  const meta = pid ? lookupProductMeta(pid) : null;

  const qty = Number(it?.qty ?? it?.quantity ?? 1) || 1;
  const price = Number(it?.price ?? meta?.price ?? 0) || 0;
  const title = meta?.name || it?.title || it?.name || `Product ${pid}`;
  const image = meta?.image || it?.image || it?.img || ''; // use || so empty string doesn't block fallback
  const category = meta?.category || it?.category;
  try {
    console.debug('enrichItem ->', { pid, image, title, price, qty });
  } catch (e) {
    /* ignore */
  }
  return {
    id: pid,
    title,
    price,
    qty,
    image,
    category,
  } as OrderItemView;
}

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Zustand selectors: currentOrder 구독 및 setOrder 액션
  const storeOrder = useOrderStore((s: any) => s.currentOrder);
  const setOrderInStore = useOrderStore((s: any) => s.setOrder);

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // -------------------------
  // Helpers for safe numbers
  // -------------------------
  const toNumberOrNull = (v: unknown): number | null => {
    if (typeof v === 'number' && !Number.isNaN(v)) return v;
    if (v == null) return null;
    const n = Number(v as unknown as string);
    return Number.isFinite(n) ? n : null;
  };

  const formatCurrency = (v: unknown): string => {
    const n = toNumberOrNull(v);
    return n === null ? '-' : n.toLocaleString();
  };

  const computeProcessTax = (subtotal: number | null): number | null => {
    if (subtotal == null) return null;
    return Math.round(subtotal * TAX_RATE);
  };

  function computeSubtotalFromItems(
    items: OrderItemView[] | undefined,
  ): number | null {
    if (!Array.isArray(items) || items.length === 0) return null;
    let s = 0;
    for (const it of items) {
      const p = toNumberOrNull(it.price) ?? 0;
      const q = toNumberOrNull(it.qty) ?? 0;
      s += p * q;
    }
    return s;
  }

  function computeTotalFallback(o: OrderDetail): number | null {
    const subtotal =
      toNumberOrNull(o.subtotal) ?? computeSubtotalFromItems(o.items);
    if (subtotal == null) return null;
    const tax = computeProcessTax(subtotal) ?? 0;
    const ship = toNumberOrNull(o.shippingCost) ?? 0;
    return subtotal + tax + ship;
  }

  // ---------- load order (single useEffect inside component) ----------
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!mounted) return;
      setLoading(true);
      setError(null);

      try {
        // 1) 라우터 state에서 전달된 order가 있으면 우선 사용
        const stateOrder = (
          location.state as unknown as { order?: OrderDetail }
        )?.order as OrderDetail | undefined;
        if (stateOrder) {
          if (!mounted) return;

          // 1) Enrich items using local catalog when metadata (price/title/image) is missing
          try {
            console.debug('OrderDetailPage: received stateOrder', {
              id: stateOrder.id,
              itemsPreview: Array.isArray(stateOrder.items)
                ? stateOrder.items.slice(0, 5)
                : stateOrder.items,
            });
          } catch (e) {
            /* ignore logging errors */
          }

          let enrichedItems: OrderItemView[] = (stateOrder.items || []).map(
            (it: any) => {
              try {
                return enrichItem(it);
              } catch (e) {
                console.warn('enrichItem failed for stateOrder item:', e, it);
                const pid =
                  Number(it?.productId ?? it?.product_id ?? it?.id) || 0;
                return {
                  id: pid,
                  title: it?.title || `Product ${pid}`,
                  price: Number(it?.price ?? 0) || 0,
                  qty: Number(it?.qty ?? 1) || 1,
                  image: it?.image || it?.img || '',
                };
              }
            },
          );

          // 2) Decide if the passed state is 'complete' enough. If not, attempt to fetch server details (when orderId looks numeric)
          const hasMissingMeta = enrichedItems.some(
            (it) =>
              !it.title ||
              !it.image ||
              toNumberOrNull(it.price) === null ||
              toNumberOrNull(it.price) === 0,
          );
          const subtotalFromItems = computeSubtotalFromItems(enrichedItems);

          let composed: OrderDetail = {
            ...stateOrder,
            items: enrichedItems,
            subtotal: stateOrder.subtotal ?? subtotalFromItems,
            shippingCost: stateOrder.shippingCost ?? 0,
          };

          const orderIdLooksNumeric = /^\d+$/.test(String(orderId));

          if (hasMissingMeta && orderIdLooksNumeric) {
            // Try to fetch full details from backend (server is the source of truth)
            try {
              const res = await fetch(`/api/orders/${orderId}`);
              if (res.ok) {
                const json = await res.json();
                const fetchedEnrichedItems: OrderItemView[] = (
                  json.items || []
                ).map((it: any) => {
                  try {
                    return enrichItem(it);
                  } catch (e) {
                    console.warn('enrichItem failed for fetched item:', e, it);
                    const pid =
                      Number(it?.productId ?? it?.product_id ?? it?.id) || 0;
                    return {
                      id: pid,
                      title: it?.title || `Product ${pid}`,
                      price: Number(it?.price ?? 0) || 0,
                      qty: Number(it?.qty ?? 1) || 1,
                      image: it?.image || it?.img || '',
                    };
                  }
                });

                composed = {
                  ...json,
                  items: fetchedEnrichedItems,
                  subtotal:
                    json.subtotal ??
                    computeSubtotalFromItems(fetchedEnrichedItems),
                  shippingCost: json.shippingCost ?? 0,
                };

                // also write to store (non-fatal)
                try {
                  if (typeof setOrderInStore === 'function')
                    setOrderInStore(composed as any);
                } catch (e) {
                  console.warn(
                    'Failed to write fetched order to store (non-fatal):',
                    e,
                  );
                }
              } else {
                console.warn(
                  `Backend returned ${res.status} for order ${orderId}; falling back to enriched state data.`,
                );
              }
            } catch (e) {
              console.warn('Backend order fetch failed (non-fatal):', e);
            }
          } else if (hasMissingMeta && !orderIdLooksNumeric) {
            // cannot fetch from backend (local ORD-...), we already enriched from local catalog as best-effort
            console.info(
              'Order came from route state and has missing metadata, but order id is non-numeric; using local-enriched data.',
            );
          }

          // Ensure items have safe numeric price/qty before rendering
          composed.items = (composed.items || []).map((it: any) => ({
            ...it,
            price: Number(it.price ?? 0) || 0,
            qty: Number(it.qty ?? 1) || 1,
            title: it.title ?? `Product ${it.id}`,
            image: it.image ?? '',
          }));

          setOrder(composed);
          setLoading(false);
          return;
        }

        // 2) Zustand store 우선 조회 (storeOrder은 selector로 구독 중)
        try {
          if (storeOrder && String(storeOrder.id) === String(orderId)) {
            const enriched: OrderItemView[] = (storeOrder.items || []).map(
              (it: any) => {
                try {
                  return enrichItem(it);
                } catch (e) {
                  console.warn('enrichItem failed for storeOrder item:', e, it);
                  const pid =
                    Number(it?.productId ?? it?.product_id ?? it?.id) || 0;
                  return {
                    id: pid,
                    title: it?.title || `Product ${pid}`,
                    price: Number(it?.price ?? 0) || 0,
                    qty: Number(it?.qty ?? 1) || 1,
                    image: it?.image || it?.img || '',
                  };
                }
              },
            );

            if (!mounted) return;
            const composed: OrderDetail = {
              ...storeOrder,
              items: enriched,
              subtotal:
                storeOrder.subtotal ?? computeSubtotalFromItems(enriched),
              shippingCost: storeOrder.shippingCost ?? 0,
            };
            setOrder(composed);
            setLoading(false);
            return;
          }
        } catch (e) {
          // store access is non-fatal; continue to backend lookup
          console.warn('Order store access failed (non-fatal):', e);
        }

        // 3) Backend GET /api/orders/:id 시도 (프록시 또는 절대 경로에 맞게 조정)
        if (orderId) {
          try {
            const res = await fetch(`/api/orders/${orderId}`);
            if (res.ok) {
              const json = await res.json();

              // normalize/augment items
              const enrichedItems: OrderItemView[] = (json.items || []).map(
                (it: any) => {
                  const pid = it.productId ?? it.product_id ?? it.id;
                  const meta = lookupProductMeta(pid);
                  return {
                    id: Number(pid),
                    qty: Number(it.qty ?? it.quantity ?? 1),
                    price: Number(it.price ?? meta?.price ?? 0),
                    title: meta?.name ?? it.title ?? `Product ${pid}`,
                    image: meta?.image ?? it.image ?? '',
                    category: meta?.category,
                  };
                },
              );

              const fullOrder: OrderDetail = {
                ...json,
                items: enrichedItems,
                subtotal:
                  json.subtotal ?? computeSubtotalFromItems(enrichedItems),
                shippingCost: json.shippingCost ?? 0,
              };

              // backend에서 받아온 주문을 스토어에 저장 (옵션)
              try {
                if (typeof setOrderInStore === 'function') {
                  // cast any to keep compatibility with store type
                  setOrderInStore(fullOrder as any);
                }
              } catch (e) {
                console.warn('Failed to write order to store (non-fatal):', e);
              }

              if (!mounted) return;
              setOrder(fullOrder);
              setLoading(false);
              return;
            } else {
              // non-OK response, fallthrough to mock
              console.warn(
                `Backend returned ${res.status} for order ${orderId}`,
              );
            }
          } catch (e) {
            console.warn('Backend order fetch failed:', e);
            // fallthrough to mock
          }
        }

        // 4) MOCK fallback
        const foundMock = MOCK_ORDERS[String(orderId)];
        if (foundMock) {
          if (!mounted) return;
          setOrder(foundMock);
          setLoading(false);
          return;
        }

        // not found
        if (!mounted) return;
        setError(`주문 ${orderId} 을(를) 찾을 수 없습니다.`);
        setOrder(null);
      } catch (e) {
        if (!mounted) return;
        console.error(e);
        setError('주문을 불러오는 중 오류가 발생했습니다.');
        setOrder(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [orderId, location.state, storeOrder, setOrderInStore]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  // Safe computed values used in UI
  const safeSubtotal = (() => {
    if (!order) return null;
    return (
      toNumberOrNull(order.subtotal) ?? computeSubtotalFromItems(order.items)
    );
  })();

  const processTax = computeProcessTax(safeSubtotal);
  const safeTotal = (() => {
    if (!order) return null;
    return toNumberOrNull(order.total) ?? computeTotalFallback(order);
  })();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30 relative overflow-hidden">
      <div className="fixed inset-0 bg-[url('/circuit-board.svg')] bg-center opacity-5 mix-blend-screen pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="group mb-8 flex items-center gap-3 text-slate-500 hover:text-cyan-400 transition-colors w-fit"
        >
          <div className="p-2 rounded-full border border-slate-800 group-hover:border-cyan-500/50 transition-all">
            <ArrowLeft size={20} />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest">
            Return to Base
          </span>
        </button>

        {loading ? (
          <div className="animate-pulse space-y-12">
            <div className="flex justify-between items-end">
              <div className="space-y-4">
                <div className="w-32 h-6 bg-slate-900/80 rounded-lg" />
                <div className="w-64 h-12 bg-slate-900/80 rounded-xl" />
              </div>
              <div className="w-32 h-10 bg-slate-900/80 rounded-xl" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="w-40 h-8 bg-slate-900/80 rounded-lg mb-6" />
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="flex gap-4 p-4 border border-white/5 rounded-2xl bg-white/[0.01]"
                  >
                    <div className="w-24 h-24 bg-slate-900 rounded-xl" />
                    <div className="flex-1 space-y-3 py-2">
                      <div className="w-3/4 h-6 bg-slate-900 rounded-lg" />
                      <div className="w-1/4 h-4 bg-slate-900 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-6">
                <div className="h-64 bg-slate-900/50 border border-white/5 rounded-3xl" />
                <div className="h-32 bg-slate-900/50 border border-white/5 rounded-3xl" />
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-white/[0.02] border border-rose-500/20 p-6">
            <h2 className="text-lg font-bold text-rose-300 mb-2">오류</h2>
            <p className="text-sm text-slate-300">{error}</p>
          </div>
        ) : order ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.header
              variants={itemVariants}
              className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2 py-1 bg-cyan-950/50 border border-cyan-500/30 rounded text-[10px] text-cyan-400 font-mono font-bold uppercase tracking-widest">
                    Log Record
                  </span>
                  <span className="text-slate-500 text-xs font-mono uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={12} /> {order.date ?? '-'}
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white italic uppercase tracking-tighter">
                  Order #{order.id}
                </h1>
              </div>

              <div className="flex items-center gap-4 ml-auto md:ml-0">
                {/* ▲ ml-auto: 모바일에서 전체 박스를 오른쪽으로 밀어냄 */}
                {/* ▲ md:ml-0: 데스크탑에서는 원래 위치(왼쪽 혹은 흐름대로)로 복귀 */}

                <div className="text-right md:text-left">
                  {/* ▲ text-right: 모바일에서 텍스트 오른쪽 정렬 */}
                  {/* ▲ md:text-left: 데스크탑에서 텍스트 왼쪽 정렬 */}
                  <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">
                    Status
                  </div>
                  <div
                    className={`flex items-center justify-end md:justify-start gap-2 text-lg font-bold uppercase italic tracking-tight ${
                      /* ▲ justify-end: 모바일에서 아이콘과 텍스트를 오른쪽 끝으로 정렬 */
                      /* ▲ md:justify-start: 데스크탑에서 왼쪽 시작으로 복귀 */
                      order.status === 'Delivered'
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {order.status === 'Delivered' ? (
                      <CheckCircle2 size={20} />
                    ) : (
                      <Truck size={20} />
                    )}
                    {order.status ?? '-'}
                  </div>{' '}
                  {order.status === 'Processing' && (
                    <div className="mt-2">
                      <button
                        // onClick={() => navigate(`/orders/${order.id}/tracking`)}
                        className="
            group inline-flex items-center justify-center gap-2
            /* 모바일(기본): 14px 텍스트, 적당한 패딩 */
              px-4 py-2.5 text-sm
              /* 데스크탑(md 이상): 16px 텍스트, 넉넉한 패딩 */
            md:px-5 md:py-2.5 md:text-base

            bg-cyan-600 text-white font-bold tracking-wide
            rounded-lg shadow-sm

            hover:bg-cyan-500 hover:shadow-md
            active:bg-cyan-700 

            transition-all duration-200 ease-in-out"
                      >
                        <span>Track Delivery</span>
                      </button>
                    </div>
                  )}{' '}
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
                  {Array.isArray(order.items) && order.items.length > 0 ? (
                    order.items.map((item) => {
                      const price = toNumberOrNull(item.price) ?? 0;
                      const qty = toNumberOrNull(item.qty) ?? 0;
                      const itemTotal = price * qty;
                      return (
                        <div
                          key={item.id}
                          className="group flex flex-col sm:flex-row gap-5 bg-white/[0.02] border border-white/5 p-4 rounded-2xl hover:border-cyan-500/30 transition-all duration-300"
                        >
                          <div className="w-full sm:w-24 aspect-square rounded-xl bg-slate-900 overflow-hidden border border-white/5 relative">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-slate-500">
                                <span className="text-xs uppercase font-mono">
                                  No Image
                                </span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                          </div>

                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <h3 className="text-lg font-bold text-white uppercase italic tracking-tight mb-1">
                                {item.title}
                              </h3>
                              <p className="text-xs text-slate-500 font-mono">
                                UNIT_ID: {item.id}
                              </p>
                            </div>

                            <div className="flex justify-between items-end mt-4 sm:mt-0">
                              <div className="text-xs font-mono bg-slate-800 px-2 py-1 rounded text-slate-300">
                                QTY: {qty}
                              </div>
                              <div className="text-xl font-black text-white">
                                <span className="text-sm font-light text-cyan-500 mr-1">
                                  $
                                </span>
                                {formatCurrency(itemTotal)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-6 border border-white/5 rounded-xl bg-white/[0.01] text-slate-400 text-sm">
                      상품 내역이 없습니다.
                    </div>
                  )}
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
                      <span>${formatCurrency(safeSubtotal)}</span>
                    </div>

                    <div className="flex justify-between text-slate-400">
                      <span>PROCESS TAX (10%)</span>
                      <span>${formatCurrency(processTax)}</span>
                    </div>

                    <div className="flex justify-between text-slate-400">
                      <span>SHIPPING</span>
                      <span>
                        {toNumberOrNull(order.shippingCost) === 0
                          ? 'FREE'
                          : toNumberOrNull(order.shippingCost) !== null
                            ? `$${formatCurrency(order.shippingCost)}`
                            : '-'}
                      </span>
                    </div>

                    <div className="h-px bg-white/10 my-2" />

                    <div className="flex justify-between text-white font-bold text-lg items-baseline">
                      <span className="tracking-widest text-xs uppercase text-cyan-500">
                        Total
                      </span>
                      <span>${formatCurrency(safeTotal)}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-cyan-950/20 border border-cyan-500/10 rounded-xl flex items-center gap-3">
                    <CreditCard className="text-cyan-400" size={16} />
                    <span className="text-xs text-cyan-100 font-mono tracking-wide">
                      {order.paymentMethod ?? '-'}
                    </span>
                  </div>
                </div>

                <div className=" border border-white/5 rounded-3xl p-6 sm:p-8">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <MapPin size={14} /> Destination
                  </h3>
                  <p className="text-white font-medium leading-relaxed">
                    {order.shippingAddress ?? '-'}
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}
