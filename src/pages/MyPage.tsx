// src/pages/MyPage.tsx
'use client';

import { fetchHybridRecommendations } from '@/api/recommend';
import ProductCard from '@/components/product/ProductCard';
import ProductDetailModal from '@/components/product/ProductDetailModal';
import { getProductById } from '@/data/products_indexed';
import useOrderStore from '@/store/orderStore';
import { useUserStore } from '@/store/userStore';
import { motion } from 'framer-motion';
import {
  Activity,
  Archive,
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit,
  ExternalLink,
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

  const [recs, setRecs] = useState<any[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const sliderRef = useRef<HTMLDivElement | null>(null);

  // --- [데이터 초기화 로직] ---
  useEffect(() => {
    if (currentUser?.email) login(currentUser.email, currentUser.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.email, login]);

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
    import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

  // --- syncOrderFeedback API helper ---
  const syncOrderFeedbackApi = async (payload: {
    userId: string;
    orderId: string;
  }) => {
    const url = `${API_BASE_URL}/orders/sync-feedback`;
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

      setLoadingRecs(true);
      try {
        const response: any = await fetchHybridRecommendations(
          seedItem.productId,
          10,
        );

        // 여러 응답 형태를 수용
        let recsArray: any[] =
          response?.recommendations ??
          response?.data ??
          (Array.isArray(response) ? response : []) ??
          [];

        // recsArray 요소가 단순 id(문자열 또는 숫자)일 수 있으므로 상품 객체로 보강
        const normalizedProducts = recsArray
          .map((it: any) => {
            if (!it) return null;
            if (typeof it === 'string' || typeof it === 'number') {
              return getProductById(it) ?? null;
            }
            if (it.product) return it.product;
            if (it.id && (it.name || it.title)) return it;
            if (it.productId) {
              const meta = getProductById(it.productId);
              return {
                id: it.productId,
                name: it.title || meta?.name || `Product ${it.productId}`,
                image: meta?.image || it.image || '',
                why: it.why,
                ...it,
              };
            }
            return null;
          })
          .filter(Boolean);

        setRecs(normalizedProducts as any[]);
      } catch (error) {
        console.error('Failed to load recommendations', error);
        setRecs([]);
      } finally {
        setLoadingRecs(false);
      }
    };

    loadRecommendations();
  }, [orders]); // orders 변경 시 다시 로드

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

    // 데이터 정규화 및 보강(Enrichment)
    const normalized = {
      ...order,
      items: (order.items || []).map((it: any) => {
        const meta = getProductById(it.productId);
        return {
          ...it,
          title: it.title || meta?.name || `Product ${it.productId}`,
          image: meta?.image || it.image || '',
        };
      }),
    };

    setOrder(normalized);

    // 사용자/주문 ID 검증
    const userIdRaw = currentUser?.id;
    if (!userIdRaw) {
      console.warn('syncOrderFeedback aborted: missing currentUser.id');
      navigate(`/orders/${normalized.id}`, { state: { order: normalized } });
      return;
    }

    try {
      await syncOrderFeedbackApi({
        userId: String(userIdRaw),
        orderId: String(normalized.id),
      });
      navigate(`/orders/${normalized.id}`, { state: { order: normalized } });
    } catch (err) {
      console.error('syncOrderFeedback failed:', err);
      // 그래도 상세 페이지로 이동(필요에 따라 취소할 수 있음)
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
      <div className="fixed inset-0 bg-[url('/circuit-board.svg')] bg-center opacity-5 mix-blend-screen pointer-events-none z-0" />

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
          {/* [CARD 1] CITIZEN PROFILE AREA */}
          <div className="lg:col-span-2 border border-cyan-500/20 rounded-3xl p-6 sm:p-8 relative overflow-hidden bg-slate-900/40 backdrop-blur-xl shadow-[0_0_40px_rgba(6,182,212,0.05)]">
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

            {/* Header Section */}
            <h3 className="text-lg font-black text-white uppercase italic tracking-tight mb-8 flex items-center gap-2">
              <UserCircle2 className="text-cyan-500" size={18} />{' '}
              CITIZEN_PROFILE_DATA
            </h3>

            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              {/* Avatar with Glow Area */}
              <div className="relative shrink-0 group">
                <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-cyan-500/30 bg-slate-950 shadow-2xl">
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      className="w-full h-full object-cover"
                      alt="Profile"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl font-black bg-gradient-to-tr from-cyan-400 to-white bg-clip-text text-transparent">
                      {currentUser.name[0]}
                    </div>
                  )}
                </div>
              </div>

              {/* Info List Section (Transaction 스타일 적용) */}
              <div className="flex-1 w-full space-y-4">
                <div className="space-y-3 font-mono text-sm">
                  <div className="flex justify-between items-center text-slate-400 border-b border-white/5 pb-2">
                    <span className="text-[10px] uppercase tracking-widest text-cyan-500/70">
                      Legal Name
                    </span>
                    <span className="text-xl font-bold text-white italic uppercase tracking-tighter">
                      {currentUser.name}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-400 border-b border-white/5 pb-2">
                    <span className="text-[10px] uppercase tracking-widest text-cyan-500/70">
                      Citizen ID
                    </span>
                    <span className="text-white">{currentUser.id}</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-[10px] uppercase tracking-widest text-cyan-500/70">
                      Access Link
                    </span>
                    <span className="text-cyan-400/80">
                      {currentUser.email}
                    </span>
                  </div>
                </div>

                {/* Action Buttons inside stylized box */}
                <div className="pt-4 flex flex-wrap gap-3">
                  <button className="flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                    <Edit size={14} /> Update_Profile
                  </button>
                  <button className="flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-900/40 transition-all text-[10px] font-black uppercase tracking-widest">
                    <Wallet size={14} /> Ledger_Payment
                  </button>
                </div>
              </div>
            </div>
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

            <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 group">
              <Settings
                size={14}
                className="group-hover:rotate-90 transition-transform duration-500"
              />
              Modify_Locator_Settings
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
                    className="w-full md:w-auto px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold uppercase tracking-widest hover:bg-cyan-500 hover:text-black hover:border-cyan-400 transition-all flex items-center justify-center gap-2 z-10 group/btn"
                  >
                    Details{' '}
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
          {/* 스크롤바 숨김 CSS (컴포넌트 범위) */}
          <style>
            {`
      /* hide scrollbar for WebKit (Chrome, Safari) */
      .no-scrollbar::-webkit-scrollbar { display: none; }
      /* hide scrollbar for Firefox */
      .no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
    `}
          </style>

          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black uppercase italic flex items-center gap-3 tracking-tight text-white">
              <Sparkles
                className="text-cyan-400"
                fill="currentColor"
                size={20}
              />{' '}
              Neural Recommendations
            </h2>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex text-[10px] font-mono text-slate-500 uppercase tracking-widest items-center gap-2 mr-4">
                <Activity
                  size={12}
                  className="animate-pulse text-emerald-500"
                />{' '}
                System Optimized
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => scrollRecs('left')}
                  className="p-2 rounded-full border border-white/10 bg-white/5 text-cyan-400 hover:bg-cyan-500 hover:text-black hover:border-cyan-400 transition-all duration-300"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => scrollRecs('right')}
                  className="p-2 rounded-full border border-white/10 bg-white/5 text-cyan-400 hover:bg-cyan-500 hover:text-black hover:border-cyan-400 transition-all duration-300"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* outer wrapper: overflow-hidden -> 숨김 처리 */}
          <div className="relative overflow-hidden pb-8">
            {/* inner scrollable area: 실제로 스크롤되며 스크롤바는 숨김(no-scrollbar) */}
            <div
              ref={sliderRef}
              className="no-scrollbar flex gap-6 overflow-x-auto snap-x scroll-smooth"
              // 선택적: 마우스 휠로 가로 스크롤이 되는 것을 막고 싶으면 아래 핸들러 활성화
              // onWheel={(e) => { e.currentTarget.scrollBy({ left: e.deltaY, behavior: 'smooth' }); e.preventDefault(); }}
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {loadingRecs ? (
                [1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-72 h-96 bg-white/5 rounded-[1.5rem] animate-pulse shrink-0 border border-white/5"
                  />
                ))
              ) : recs.length === 0 ? (
                <div className="text-slate-500 p-4">
                  No recommendations available.
                </div>
              ) : (
                recs.map((item: any) => (
                  <div
                    key={item.id ?? String(Math.random())}
                    className="snap-start shrink-0 w-72 flex flex-col gap-3 group"
                  >
                    <div
                      className="cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
                      onClick={() => setSelectedProduct(item)}
                    >
                      <ProductCard product={item} />
                    </div>
                    {item.why && (
                      <div className="px-3 py-2 bg-slate-900/80 border border-cyan-500/20 rounded-lg flex items-start gap-2 backdrop-blur-md">
                        <ExternalLink
                          size={10}
                          className="text-cyan-500 mt-0.5 shrink-0"
                        />
                        <p className="text-[9px] text-cyan-100 font-mono uppercase leading-tight line-clamp-2">
                          <span className="text-cyan-400 font-bold mr-1">
                            AI_REASON:
                          </span>
                          {item.why}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
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
