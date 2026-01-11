// src/pages/MyPage.tsx
'use client';

import { fetchHybridRecommendations } from '@/api/recommend';
import ProductCard from '@/components/product/ProductCard';
import ProductDetailModal from '@/components/product/ProductDetailModal';
import demoProductsRaw from '@/data/demo_products_500.json';
import { getProductById } from '@/data/products_indexed';
import type { OrderShape } from '@/store/orderStore';
import useOrderStore from '@/store/orderStore';
import { useUserStore } from '@/store/userStore';
import type { Recommendation } from '@/types/recommendation';

import { motion } from 'framer-motion';
import {
  Activity,
  Archive,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit,
  History,
  MapPin,
  Package,
  RefreshCcw,
  Settings,
  Sparkles,
  Truck,
  UserCircle2,
  Wallet,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';

interface MyPageProps {
  currentUser: {
    id?: string | number;
    name: string;
    email: string;
    avatar?: string;
    role?: string;
  };
}

export default function MyPage({ currentUser }: MyPageProps) {
  const navigate = useNavigate();
  const { login, getCurrentUser } = useUserStore();
  const setOrder = useOrderStore((s) => s.setOrder);

  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [recsLoading, setRecsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const sliderRef = useRef<HTMLDivElement | null>(null);

  // circuit-board path — use import.meta.url fallback to reduce 404s in some bundlers
  const circuitBoardUrl = (() => {
    try {
      return new URL('/circuit-board.svg', import.meta.url).href;
    } catch (e) {
      return '/circuit-board.svg';
    }
  })();

  // --- [데이터 초기화 로직] ---
  useEffect(() => {
    if (currentUser?.email) {
      try {
        // try common signature
        // @ts-ignore
        login(currentUser.email, currentUser.name);
      } catch (e) {
        try {
          // try object signature
          // @ts-ignore
          login({
            id: currentUser.id,
            email: currentUser.email,
            name: currentUser.name,
          });
        } catch {
          // non-fatal
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.email, login]);

  // getCurrentUser() returns the UserData defined in the store (which has profile but not `id`)
  const userData = getCurrentUser();
  const orders = userData?.orders ?? [];
  const hasAddress =
    !!userData?.profile?.addresses && userData.profile.addresses.length > 0;

  // --- [통계 계산 로직] ---
  const orderStats = useMemo(() => {
    return orders.reduce(
      (acc, order: any) => {
        const status = order?.status;
        if (status === 'Delivered') acc.delivered++;
        else if (status === 'Shipped') acc.shipped++;
        else acc.processing++;
        return acc;
      },
      { processing: 0, shipped: 0, delivered: 0, refunded: 0 },
    );
  }, [orders]);

  // --- API base ---
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  // --- syncOrderFeedback API helper ---
  const syncOrderFeedbackApi = async (payload: {
    userId: string;
    orderId: string;
    action: string;
  }) => {
    const url = `${API_BASE_URL}/api/ai/feedback`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include',
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`sync failed: ${res.status} ${res.statusText} ${text}`);
    }
    return res.json().catch(() => null);
  };

  // --- [AI 추천 & 슬라이더 로직] ---
  useEffect(() => {
    const loadRecommendations = async () => {
      if (!orders || orders.length === 0) {
        setRecs([]);
        return;
      }
      const seedItem = orders[0]?.items?.[0];
      if (!seedItem) {
        setRecs([]);
        return;
      }

      setRecsLoading(true);
      try {
        // 안전하게 product id 추출 (여러 필드명 호환)
        const seedProductId = Number(
          (seedItem as any).productId ??
            (seedItem as any).product_id ??
            (seedItem as any).id ??
            NaN,
        );
        if (!Number.isFinite(seedProductId)) {
          console.warn('Invalid seed product id', seedItem);
          setRecs([]);
          return;
        }

        const response: any = await fetchHybridRecommendations(
          seedProductId,
          10,
        );

        let recsArray: any[] =
          response?.recommendations ??
          response?.data ??
          (Array.isArray(response) ? response : []) ??
          [];

        // fallback: demo products so UI doesn't stay empty
        if (!recsArray || recsArray.length === 0) {
          recsArray = (demoProductsRaw as any[]).slice(0, 6) || [];
        }

        const normalizedProducts: Recommendation[] = recsArray
          .map((it: any): Recommendation | null => {
            if (!it) return null;

            // already a rich object from backend
            if (it.id && (it.name || it.title)) {
              return {
                id: it.id,
                name: it.name ?? it.title,
                title: it.title ?? it.name,
                price: Number(it.price ?? 0),
                image: it.image ?? '',
                why: it.why ?? null,
                confidence:
                  typeof it.confidence === 'number' ? it.confidence : undefined,
                // preserve any raw fields
                raw: it,
              } as Recommendation;
            }

            // numeric/string id -> try to enrich from local index but preserve reason
            if (typeof it === 'string' || typeof it === 'number') {
              const meta = getProductById(Number(it));
              if (!meta) return null;
              return {
                ...meta,
                why: 'ID recall',
                confidence: 0.2,
              } as Recommendation;
            }

            // if backend returned product wrapper
            if (it.product) {
              return {
                id: it.product.id ?? it.productId,
                name: it.product.name ?? it.product.title,
                price: Number(it.product.price ?? 0),
                image: it.product.image ?? it.image ?? '',
                why: it.why ?? it.reason ?? null,
                confidence: it.confidence,
                raw: it,
              } as Recommendation;
            }

            return null;
          })
          .filter((item): item is Recommendation => item !== null);

        setRecs(normalizedProducts);
      } catch (error) {
        console.error('Failed to load recommendations', error);
        setRecs((demoProductsRaw as any[]).slice(0, 6) ?? []);
      } finally {
        setRecsLoading(false);
      }
    };

    loadRecommendations();
  }, [orders]); // keep orders dependency

  const scrollRecs = (dir: 'left' | 'right') => {
    if (!sliderRef.current) return;
    const distance = sliderRef.current.clientWidth * 0.7;
    sliderRef.current.scrollBy({
      left: dir === 'left' ? -distance : distance,
      behavior: 'smooth',
    });
  };

  // --- [상세보기 & 피드백 동기화 로직] ---
  const onDetailsClick = (order: any) => async (e: MouseEvent) => {
    e.preventDefault();
    if (!order?.id) return;

    // order 객체를 OrderShape로 변환
    const normalized: OrderShape = {
      id: order.id,
      userId: order.userId ?? currentUser?.id,
      items: (order.items || []).map((item: any) => ({
        productId: item.productId ?? item.product_id ?? item.id,
        qty: item.qty ?? item.quantity ?? 1,
        price: item.price ?? 0,
        title: item.title ?? item.name,
        image: item.image,
        category: item.category,
      })),
      total: order.total ?? order.totalAmount,
      status: order.status,
    };

    setOrder(normalized);

    // 사용자/주문 ID 검증 (use store fallback)
    const storeUser = getCurrentUser?.();
    const userIdRaw = currentUser?.id ?? storeUser?.profile?.email;

    if (!userIdRaw) {
      console.warn('syncOrderFeedback aborted: missing currentUser.id');
      navigate(`/orders/${normalized.id}`, { state: { order: normalized } });
      return;
    }

    try {
      await syncOrderFeedbackApi({
        userId: String(userIdRaw),
        orderId: String(normalized.id),
        action: 'view_details',
      });
      navigate(`/orders/${normalized.id}`, { state: { order: normalized } });
    } catch (err) {
      console.error('syncOrderFeedback failed:', err);
      navigate(`/orders/${normalized.id}`, { state: { order: normalized } });
    }
  };

  // --- [애니메이션 설정] ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen text-slate-200 selection:bg-cyan-500/30 relative font-sans bg-slate-950 overflow-hidden">
      {/* 회로 패턴 배경: 배포시 public/circuit-board.svg 존재 확인 */}
      <div
        className="fixed inset-0 bg-center opacity-5 mix-blend-screen pointer-events-none z-0"
        style={{ backgroundImage: `url(${circuitBoardUrl})` }}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 space-y-12"
      >
        {/* 뒤로가기 버튼 */}
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-3 text-slate-500 hover:text-cyan-400 transition-colors w-fit"
        >
          <div className="p-3 bg-white/5 backdrop-blur-sm border border-white/10 text-cyan-400 rounded-full hover:bg-cyan-500/20 hover:border-cyan-500/30 transition-all shadow-lg">
            <ArrowLeft size={20} />
          </div>
        </button>

        {/* 프로필 & 주소 섹션 */}
        <motion.section
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* [CARD 1] CITIZEN PROFILE AREA - OrderDetailPage 스타일 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Section - OrderDetailPage 스타일 적용 */}
            <motion.header
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-2 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-widest border bg-emerald-950/50 border-emerald-500/30 text-emerald-400">
                    VERIFIED USER
                  </span>
                  <span className="text-slate-500 text-xs font-mono uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={12} /> Member Since
                  </span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-black text-white italic uppercase tracking-tighter">
                  {currentUser.name}
                  <span className="text-slate-600"> #{currentUser.id}</span>
                </h1>
              </div>

              <div className="text-right md:text-left">
                {/* Avatar with Glow Area */}
                <div className="relative shrink-0 group inline-block">
                  <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden border-2 border-cyan-500/30 bg-slate-950 shadow-2xl">
                    {currentUser.avatar ? (
                      <img
                        src={currentUser.avatar}
                        className="w-full h-full object-cover"
                        alt="Profile"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl md:text-5xl font-black bg-gradient-to-tr from-cyan-400 to-white bg-clip-text text-transparent">
                        {currentUser.name?.[0] ?? 'U'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.header>

            {/* Info List Section */}
            <motion.div variants={itemVariants} className="space-y-6">
              <div className="flex items-center gap-2 border-b border-white/10 pb-4">
                <UserCircle2 className="text-cyan-500" size={20} />
                <h2 className="text-xl font-black uppercase italic tracking-tight text-white">
                  Profile Information
                </h2>
              </div>

              <div className="space-y-3 font-mono text-sm">
                <div className="flex justify-between items-center text-slate-400 border-b border-white/5 pb-2">
                  <span className="text-[10px] uppercase tracking-widest text-cyan-500/70">
                    Citizen ID
                  </span>
                  <span className="text-white">{currentUser.id}</span>
                </div>

                <div className="flex justify-between items-center text-slate-400 border-b border-white/5 pb-2">
                  <span className="text-[10px] uppercase tracking-widest text-cyan-500/70">
                    Access Link
                  </span>
                  <span className="text-cyan-400/80">{currentUser.email}</span>
                </div>
              </div>

              {/* Action Buttons inside stylized box */}
              <div className="pt-4 flex flex-wrap gap-3">
                <button className="relative flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(6,182,212,0.4)] overflow-hidden">
                  <span className="relative z-10 flex items-center gap-2">
                    <Edit size={14} /> Update_Profile
                  </span>
                </button>
                <button className="relative flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-900/40 transition-all text-[10px] font-black uppercase tracking-widest overflow-hidden">
                  <span className="relative z-10 flex items-center gap-2">
                    <Wallet size={14} /> Ledger_Payment
                  </span>
                </button>
              </div>
            </motion.div>
          </div>

          {/* [CARD 2] SHIPPING DATA AREA */}
          <div className="border border-cyan-500/20 rounded-3xl p-6 sm:p-8 relative overflow-hidden bg-slate-900/40 backdrop-blur-xl shadow-[0_0_40px_rgba(6,182,212,0.05)] flex flex-col justify-between">
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

            <div>
              <h3 className="text-lg font-black text-white uppercase italic tracking-tight mb-6 flex items-center gap-2">
                <MapPin className="text-cyan-500" size={18} /> Logistic_Locator
              </h3>

              <div className="space-y-3 mb-6 font-mono text-sm">
                <div className="flex justify-between text-slate-400 text-[10px] tracking-widest uppercase">
                  <span>Status</span>
                  <span className="text-emerald-400 italic font-bold">
                    Verified
                  </span>
                </div>
                <div className="h-px bg-white/10 my-2" />

                {/* Address Content Box */}
                <div className="p-4 bg-cyan-950/20 border border-cyan-500/10 rounded-xl">
                  <p className="text-sm text-cyan-100/80 leading-relaxed font-mono">
                    {hasAddress
                      ? userData.profile.addresses[0]
                      : 'No deployment address found.'}
                  </p>
                </div>
              </div>
            </div>

            <button className="relative w-full py-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 overflow-hidden">
              <span className="relative z-10 flex items-center gap-2">
                <Settings
                  size={14}
                  className="transition-transform duration-500 group-hover:rotate-90"
                />
                Modify_Locator_Settings
              </span>
            </button>
          </div>
        </motion.section>

        {/* 통계 카드 섹션 */}
        <motion.section
          variants={itemVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          <StatusCard
            label="Processing"
            count={orderStats.processing}
            icon={<Archive size={24} />}
            color="text-slate-400"
          />
          <StatusCard
            label="Shipped"
            count={orderStats.shipped}
            icon={<Truck size={24} />}
            color="text-cyan-400"
          />
          <StatusCard
            label="Delivered"
            count={orderStats.delivered}
            icon={<CheckCircle2 size={24} />}
            color="text-emerald-400"
          />
          <StatusCard
            label="Refunds"
            count={orderStats.refunded}
            icon={<RefreshCcw size={24} />}
            color="text-rose-400"
          />
        </motion.section>

        {/* 주문 내역 섹션 */}
        <motion.section variants={itemVariants} className="space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <Package className="text-cyan-500" size={24} />
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">
              Recent Operations
            </h2>
            <span className="ml-auto text-[10px] font-mono text-slate-500 uppercase tracking-widest hidden sm:block">
              // Transaction History
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {orders.length === 0 ? (
              <div className="p-16 text-center bg-white/5 rounded-[2rem] border border-dashed border-white/10 flex flex-col items-center gap-4">
                <History className="text-slate-700" size={48} />
                <p className="text-slate-500 font-black uppercase tracking-widest text-sm">
                  No transaction data found.
                </p>
              </div>
            ) : (
              orders.map((order: any) => (
                <div
                  key={order.id}
                  className="group relative bg-white/[0.02] border border-white/5 p-6 rounded-[1.5rem] hover:border-cyan-500/30 hover:bg-white/[0.04] transition-all duration-300 flex flex-col md:flex-row justify-between items-center gap-6 overflow-hidden"
                >
                  <div className="flex items-center gap-8 w-full md:w-auto z-10">
                    <div className="p-4 border border-white/10 rounded-xl group-hover:border-cyan-500/20 transition-colors">
                      <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">
                        Order ID
                      </div>
                      <div className="font-mono text-cyan-400 font-bold tracking-wider">
                        #{String(order.id).slice(0, 8)}
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-black text-white italic tracking-tight">
                        <span className="text-sm font-light text-cyan-500 mr-1">
                          $
                        </span>
                        {Number(order.total ?? 0).toLocaleString()}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-emerald-500/50" />
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={onDetailsClick(order)}
                    className="relative w-full md:w-auto px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold uppercase tracking-widest hover:bg-cyan-500 hover:text-black hover:border-cyan-400 transition-all flex items-center justify-center gap-2 z-10 overflow-hidden"
                  >
                    <span className="relative z-10">Details</span>
                  </button>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </div>
              ))
            )}
          </div>
        </motion.section>

        {/* AI 추천 슬라이더 섹션 */}
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
                    className="min-w-[280px] sm:min-w-[320px] snap-center h-full flex flex-col gap-2"
                  >
                    <ProductCard
                      product={product}
                      onOpen={() => setSelectedProduct(product)}
                    />

                    {/* ✅ 추천 이유 복원 */}
                    {product.why && (
                      <div className="md:hidden px-3 py-2 rounded-xl bg-slate-900/80 border border-cyan-500/20">
                        <p className="text-[10px] font-mono text-cyan-200 leading-tight">
                          <span className="text-cyan-400 font-bold mr-1">
                            AI_REASON:
                          </span>
                          {product.why}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
          </div>
        </motion.section>
      </motion.div>

      {/* 모달 */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}

// StatusCard 컴포넌트
function StatusCard({
  label,
  count,
  icon,
  color,
}: {
  label: string;
  count: number;
  icon: any;
  color: string;
}) {
  return (
    <div className="p-6 rounded-[1.5rem] bg-slate-900/40 border border-white/5 backdrop-blur-sm flex flex-col items-center justify-center gap-2 group hover:border-white/20 transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]">
      <div
        className={`${color} opacity-70 group-hover:opacity-100 transition-opacity`}
      >
        {icon}
      </div>
      <div className="text-3xl font-black text-white">{count}</div>
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
        {label}
      </div>
    </div>
  );
}
