// src/pages/OrderDetailPage.tsx
"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  CreditCard,
  MapPin,
  Package,
  ShieldCheck,
  Truck
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

interface OrderItem {
  id: number;
  title: string;
  price: number;
  qty: number;
  image: string;
}

interface OrderDetail {
  id: string;
  date?: string;
  status?: "Processing" | "Shipped" | "Delivered" | "Cancelled" | string;
  items?: OrderItem[] | undefined;
  subtotal?: number | null;
  shippingCost?: number | null;
  total?: number | null;
  shippingAddress?: string;
  paymentMethod?: string;
}

/** 개발용 모의 데이터 (필요 시 제거) */
const MOCK_ORDERS: Record<string, OrderDetail> = {
  "1": {
    id: "1",
    date: "2024.05.21 14:30:22",
    status: "Delivered",
    items: [
      {
        id: 101,
        title: "NEURAL INTERFACE V2",
        price: 1250,
        qty: 1,
        image:
          "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=200",
      },
      {
        id: 102,
        title: "QUANTUM PROCESSOR CORE",
        price: 800,
        qty: 2,
        image:
          "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=200",
      },
    ],
    subtotal: 2850,
    shippingCost: 0,
    total: 2850,
    shippingAddress: "Sector 7G, Cyber District, Neo-Seoul, KR",
    paymentMethod: "Credits (****-1024)",
  },
  "2": {
    id: "2",
    date: "2024.06.02 09:12:05",
    status: "Shipped",
    items: [
      {
        id: 201,
        title: "AERO GLIDE MODULE",
        price: 450,
        qty: 1,
        image:
          "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?auto=format&fit=crop&q=80&w=200",
      },
      {
        id: 202,
        title: "PLASMA BATTERY PACK",
        price: 230,
        qty: 3,
        image:
          "https://images.unsplash.com/photo-1555685812-4b943f1a9b50?auto=format&fit=crop&q=80&w=200",
      },
    ],
    subtotal: 1140,
    shippingCost: 25,
    total: 1165,
    shippingAddress: "Hangang-ro, Mapo-gu, Seoul, KR",
    paymentMethod: "Card (****-3321)",
  },
};

const TAX_RATE = 0.1; // 10%

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // -------------------------
  // Helpers for safe numbers
  // -------------------------
  const toNumberOrNull = (v: any): number | null => {
    if (typeof v === "number" && !Number.isNaN(v)) return v;
    if (v == null) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const formatCurrency = (v: any): string => {
    const n = toNumberOrNull(v);
    return n === null ? "-" : n.toLocaleString();
  };

  const computeProcessTax = (subtotal: number | null): number | null => {
    if (subtotal == null) return null;
    // 반올림 처리 (원 단위)
    return Math.round(subtotal * TAX_RATE);
  };

  function computeSubtotalFromItems(items: OrderItem[] | undefined): number | null {
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
    const subtotal = toNumberOrNull(o.subtotal) ?? computeSubtotalFromItems(o.items);
    if (subtotal == null) return null;
    const tax = computeProcessTax(subtotal) ?? 0;
    const ship = toNumberOrNull(o.shippingCost) ?? 0;
    return subtotal + tax + ship;
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1) 라우터 state가 있으면 우선 사용 (MyPage에서 navigate(`/orders/${id}`, { state: { order } }))
        const stateOrder = (location.state as any)?.order as OrderDetail | undefined;
        if (stateOrder) {
          setOrder(stateOrder);
          setLoading(false);
          return;
        }

        // 2) 라우트 상태가 없으면 orderId로 조회 (실제 API 또는 mock)
        if (!orderId) {
          setError("Order ID가 제공되지 않았습니다.");
          setOrder(null);
          setLoading(false);
          return;
        }

        // 실제 API 호출 예시(주석) ----------------------------------------------------
        // const resp = await fetch(`/api/orders/${orderId}`);
        // if (!resp.ok) throw new Error(`Order fetch failed: ${resp.status}`);
        // const data: OrderDetail = await resp.json();
        // setOrder(data);
        // ----------------------------------------------------------------------------

        // 개발용: MOCK_ORDERS에서 찾기
        const found = MOCK_ORDERS[orderId];
        if (found) {
          setOrder(found);
        } else {
          setError(`주문 ${orderId} 을(를) 찾을 수 없습니다.`);
          setOrder(null);
        }
      } catch (e) {
        console.error(e);
        setError("주문을 불러오는 중 오류가 발생했습니다.");
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    load();
    // location.state와 orderId에 의존: location.state가 바뀌면 새 상태 반영
  }, [orderId, location.state]);

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
    return toNumberOrNull(order.subtotal) ?? computeSubtotalFromItems(order.items);
  })();

  const safeShipping = (() => {
    if (!order) return null;
    return toNumberOrNull(order.shippingCost) ?? 0;
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
          <span className="text-xs font-bold uppercase tracking-widest">Return to Base</span>
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
                  <div key={i} className="flex gap-4 p-4 border border-white/5 rounded-2xl bg-white/[0.01]">
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
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <motion.header variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2 py-1 bg-cyan-950/50 border border-cyan-500/30 rounded text-[10px] text-cyan-400 font-mono font-bold uppercase tracking-widest">
                    Log Record
                  </span>
                  <span className="text-slate-500 text-xs font-mono uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={12} /> {order.date ?? "-"}
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white italic uppercase tracking-tighter">
                  Order #{order.id}
                </h1>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Status</div>
                  <div className={`flex items-center gap-2 text-lg font-bold uppercase italic tracking-tight ${
                    order.status === 'Delivered' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {order.status === 'Delivered' ? <CheckCircle2 size={20} /> : <Truck size={20} />}
                    {order.status ?? "-"}
                  </div>
                </div>
              </div>
            </motion.header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
                <div className="flex items-center gap-2 border-b border-white/10 pb-4">
                  <Package className="text-cyan-500" size={20} />
                  <h2 className="text-xl font-black uppercase italic tracking-tight text-white">Manifest // Items</h2>
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
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                          </div>

                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <h3 className="text-lg font-bold text-white uppercase italic tracking-tight mb-1">{item.title}</h3>
                              <p className="text-xs text-slate-500 font-mono">UNIT_ID: {item.id}</p>
                            </div>

                            <div className="flex justify-between items-end mt-4 sm:mt-0">
                              <div className="text-xs font-mono bg-slate-800 px-2 py-1 rounded text-slate-300">
                                QTY: {qty}
                              </div>
                              <div className="text-xl font-black text-white">
                                <span className="text-sm font-light text-cyan-500 mr-1">$</span>
                                {itemTotal.toLocaleString()}
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
                    <ShieldCheck className="text-cyan-500" size={18} /> Transaction Data
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
                          ? "FREE"
                          : (toNumberOrNull(order.shippingCost) !== null ? `$${formatCurrency(order.shippingCost)}` : "-")}
                      </span>
                    </div>

                    <div className="h-px bg-white/10 my-2" />

                    <div className="flex justify-between text-white font-bold text-lg items-baseline">
                      <span className="tracking-widest text-xs uppercase text-cyan-500">Total</span>
                      <span>${formatCurrency(safeTotal)}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-cyan-950/20 border border-cyan-500/10 rounded-xl flex items-center gap-3">
                    <CreditCard className="text-cyan-400" size={16} />
                    <span className="text-xs text-cyan-100 font-mono tracking-wide">{order.paymentMethod ?? "-"}</span>
                  </div>
                </div>

                <div className=" border border-white/5 rounded-3xl p-6 sm:p-8">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <MapPin size={14} /> Destination
                  </h3>
                  <p className="text-white font-medium leading-relaxed">
                    {order.shippingAddress ?? "-"}
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
