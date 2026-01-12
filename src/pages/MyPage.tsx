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
                  {/* currentUser.id가 있을 때만 #ID를 표시 */}
                  {currentUser.id && (
                    <span className="text-slate-600"> #{currentUser.id}</span>
                  )}
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
                {/* 1. Update Profile Button (Primary Hologram) */}
                <button
                  className="
    relative group overflow-hidden rounded-xl px-5 py-2.5
    /* 배경: 반투명 Cyan 그라디언트 */
    bg-gradient-to-r from-cyan-950/40 to-cyan-900/20 
    border border-cyan-500/30
    /* 호버: 밝기 증가 및 글로우 효과 */
    hover:bg-cyan-500/20 hover:border-cyan-400/60 
    hover:shadow-[0_0_20px_-5px_rgba(6,182,212,0.4)]
    transition-all duration-300 ease-out cursor-pointer
  "
                >
                  <span
                    className="
    relative z-10 flex items-center gap-2 
    text-[10px] font-black uppercase tracking-widest 
    text-cyan-400 group-hover:text-white 
    transition-colors duration-300 pt-0.5
  "
                  >
                    <Edit
                      size={14}
                      className="
      /* 1. 기계적인 회전: 45도로 확실하게 꺾어줍니다. */
      group-hover:rotate-45 
      /* 2. 입체감: 호버 시 아주 살짝 튀어나오는 느낌 */
      group-hover:scale-110
      /* 3. 서보 모터 효과: 마지막에 살짝 튕기는 베지어 곡선 */
      transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
    "
                    />
                    Update_Profile
                  </span>

                  {/* 호버 시 하단 레이저 바 */}
                  <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-hover:opacity-100 blur-[1px] transition-opacity duration-300" />
                </button>

                {/* 2. Ledger Payment Button (Secondary Secure Module) */}
                <button
                  className="
    relative group overflow-hidden rounded-xl px-5 py-2.5
    /* 배경: 더 어두운 Slate 배경 (보안 느낌) */
    bg-slate-950/60 
    border border-white/10
    /* 호버: Cyan 테두리와 배경 은은하게 켜짐 */
    hover:border-cyan-500/40 hover:bg-cyan-950/30
    transition-all duration-300 ease-out cursor-pointer
  "
                >
                  <span
                    className="
      relative z-10 flex items-center gap-2 
      text-[10px] font-black uppercase tracking-widest 
      /* 평소엔 Slate-400 (비활성 느낌) -> 호버 시 Cyan-300 (활성) */
      text-slate-400 group-hover:text-cyan-300 
      transition-colors duration-300 pt-0.5
    "
                  >
                    <Wallet
                      size={14}
                      className="text-slate-500 group-hover:text-cyan-400 transition-colors"
                    />
                    Ledger_Payment
                  </span>

                  {/* 배경 스캔 효과 (데이터 처리 느낌) */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-cyan-500/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                </button>
              </div>
            </motion.div>
          </div>

          {/* [CARD 2] SHIPPING DATA AREA */}
          <div className="border border-cyan-500/20 rounded-3xl p-6 sm:p-8 relative overflow-hidden bg-slate-900/40 backdrop-blur-xl shadow-[0_0_40px_rgba(6,182,212,0.05)] flex flex-col justify-between">
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

            <div>
              {/* 1. 용어 변경: Logistic_Locator -> Shipping Destination */}
              <h3 className="text-lg font-black text-white uppercase italic tracking-tight mb-6 flex items-center gap-2">
                <MapPin className="text-cyan-500" size={18} /> Shipping
                Destination
              </h3>

              <div className="space-y-3 mb-6 font-mono text-sm">
                <div className="flex justify-between text-slate-400 text-[10px] tracking-widest uppercase">
                  <span>Current Node</span>
                  {/* 2. 용어 변경: Verified -> Active Link */}
                  <span className="text-emerald-400 italic font-bold">
                    Active Link
                  </span>
                </div>
                <div className="h-px bg-white/10 my-2" />

                {/* Address Content Box */}
                <div className="p-4 bg-cyan-950/20 border border-cyan-500/10 rounded-xl">
                  <p className="text-sm text-cyan-100/80 leading-relaxed font-mono">
                    {hasAddress
                      ? userData.profile.addresses[0]
                      : // 3. 문구 변경: 조금 더 자연스러운 문장으로
                        'No shipping coordinates registered.'}
                  </p>
                </div>
              </div>
            </div>

            <button className="group relative w-full py-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-cyan-500/5 hover:shadow-[0_0_40px_rgba(6,182,212,0.1)] transition-all text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 overflow-hidden">
              <span className="relative z-10 flex items-center gap-2">
                <Settings
                  size={14}
                  className="transition-transform duration-500 group-hover:rotate-45 group-hover:scale-110 "
                />
                Update Coordinates
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
                  className="group relative bg-white/[0.02] border border-white/5 p-6 rounded-[1.5rem] hover:border-cyan-500/30 hover:bg-white/[0.04] hover:shadow-[0_0_40px_rgba(6,182,212,0.1)] transition-all duration-300 flex flex-col md:flex-row justify-between items-center gap-6 overflow-hidden"
                >
                  <div className="flex items-center gap-8 w-full md:w-auto z-10">
                    <div className="p-4 border border-white/10 rounded-xl group-hover:border-cyan-500/20 transition-colors">
                      <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">
                        Order ID
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
                    className="
    relative group/btn overflow-hidden rounded-lg sm:rounded-xl
    /* 레이아웃 & 크기 (기존 반응형 유지 + 요청된 스타일 통합) */
    w-full md:w-auto cursor-pointer
    
    /* 배경 & 테두리 스타일 (New Design) */
    bg-gradient-to-r from-cyan-900/20 to-cyan-800/20
    border border-cyan-500/20
    
    /* 호버 효과 (New Design) */
    hover:border-cyan-400/50 hover:from-cyan-500/10 hover:to-cyan-400/20
    focus:outline-none transition-all duration-300
  "
                  >
                    {/* 내부 콘텐츠 래퍼 (패딩 및 정렬) */}
                    <div className="relative z-10 flex items-center justify-center gap-2 px-6 sm:px-8 py-2 sm:py-3">
                      <span
                        className="
                        text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] 
                        text-slate-200 group-hover/btn:text-cyan-200 transition-colors pt-0.5
                        "
                      >
                        Details
                      </span>
                    </div>

                    {/* 하단 글로우 바 (선택 사항: 이전 디자인 컨셉 통일감을 위해 추가) */}
                    <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 blur-[2px]" />
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
                      <div className="md:hidden px-3 py-2 rounded-xl bg-slate-900/80 border border-white/5">
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
    <div className="p-6 rounded-[1.5rem] bg-slate-900/40 border border-white/5 backdrop-blur-sm flex flex-col items-center justify-center gap-2 group hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-all">
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
