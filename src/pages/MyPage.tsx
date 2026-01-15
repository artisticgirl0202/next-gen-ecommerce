'use client';

import { sendAIFeedbackAPI } from '@/api/integration';
import { fetchHybridRecommendations } from '@/api/recommend';
import ProductCard from '@/components/product/ProductCard';
import ProductDetailModal from '@/components/product/ProductDetailModal';
import type { OrderShape } from '@/store/orderStore';
import useOrderStore from '@/store/orderStore';
import { useUserStore } from '@/store/userStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, Variants } from 'framer-motion';
import {
  Activity,
  Archive,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CornerDownRight,
  Edit,
  History,
  MapPin,
  Package,
  RefreshCcw,
  Sparkles,
  Truck,
  Wallet,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
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
  const queryClient = useQueryClient();
  const { login, getCurrentUser } = useUserStore();
  const setOrder = useOrderStore((s) => s.setOrder);

  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const sliderRef = useRef<HTMLDivElement | null>(null);

  // Background pattern path
  const circuitBoardUrl = '/circuit-board.svg';

  // --- Profile Sync ---
  useEffect(() => {
    if (currentUser?.email) {
      try {
        login(currentUser.email, currentUser.name);
      } catch (e) {
        // Fallback for different user store versions
      }
    }
  }, [currentUser?.email, login, currentUser.name]);

  const userData = getCurrentUser();
  const orders = userData?.orders ?? [];

  // 1. Seed Product for AI Recommendation
  const seedProductId = useMemo(() => {
    if (!orders || orders.length === 0) return 0;
    const seedItem = orders[0]?.items?.[0];
    // [수정] 타입 단언을 사용하여 id 접근 오류 방지 및 중복 코드 정리
    return Number(seedItem?.productId ?? (seedItem as any)?.id ?? 0);
  }, [orders]);

  // 2. Fetch AI Recommendations
  const { data: recData, isLoading: recsLoading } = useQuery({
    queryKey: ['hybrid-recs', seedProductId, currentUser?.id],
    queryFn: () => fetchHybridRecommendations(seedProductId, 10),
    enabled: !!seedProductId,
    staleTime: 1000 * 60 * 5,
  });

  // 3. AI Feedback Mutation
  const actionMutation = useMutation({
    mutationFn: (variables: { productId: number; action: string }) =>
      sendAIFeedbackAPI({
        userId: currentUser?.id ?? 0,
        productId: variables.productId,
        action: variables.action,
        orderId: -1,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hybrid-recs'] });
    },
  });

  const recs = recData?.recommendations ?? [];
  const hasAddress =
    !!userData?.profile?.addresses && userData.profile.addresses.length > 0;

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

  const handleDetailsClick = (order: any) => {
    if (!order?.id) return;
    const normalized: OrderShape = {
      id: order.id,
      userId: order.userId ?? currentUser?.id,
      items: (order.items || []).map((item: any) => ({
        // [수정] 중복된 nullish coalescing 정리
        productId: item.productId ?? item.id ?? 0,
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
    navigate(`/orders/${order.id}`, { state: { order: normalized } });
  };

  const scrollRecs = (dir: 'left' | 'right') => {
    if (!sliderRef.current) return;
    const distance = sliderRef.current.clientWidth * 0.7;
    sliderRef.current.scrollBy({
      left: dir === 'left' ? -distance : distance,
      behavior: 'smooth',
    });
  };

  // --- Animation Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1.0],
      },
    },
  };

  // --- Helpers ---
  const getTranslatedReason = (text: string) => {
    if (!text) return '';
    if (/^[\x00-\x7F]*$/.test(text)) return text;
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

    return 'Optimal match based on profile.';
  };

  return (
    <div className="min-h-screen text-slate-200 selection:bg-cyan-500/30 relative font-sans bg-slate-950 overflow-hidden">
      {/* 배경 레이어: 회로도 + 사이버네틱 그리드 추가 */}
      <div
        className="fixed inset-0 bg-center opacity-5 mix-blend-screen pointer-events-none z-0"
        style={{ backgroundImage: `url(${circuitBoardUrl})` }}
      />
      <div className="fixed inset-0 bg-[linear-gradient(rgba(6,182,212,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 space-y-12"
      >
        {/* 네비게이션 헤더 */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-3 text-slate-500 hover:text-cyan-400 transition-colors w-fit"
          >
            <div className="p-3 bg-white/5 backdrop-blur-sm border border-white/10 text-cyan-400 rounded-full hover:bg-cyan-500/20 hover:border-cyan-500/30 transition-all shadow-lg">
              <ArrowLeft size={20} />
            </div>
            <span className="text-xs font-mono uppercase tracking-[0.2em] hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0"></span>
          </button>

          <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-500/50 uppercase tracking-widest border border-cyan-500/20 px-3 py-1 rounded-full bg-cyan-950/20">
            <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" />
            System_Ready
          </div>
        </div>

        {/* 메인 섹션: 프로필 & 주소 (디자인 대폭 업그레이드) */}
        <motion.section
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* --- [LEFT] IDENTITY MODULE (프로필) --- */}
          <div className="lg:col-span-2 relative group">
            {/* 장식용 코너 브라켓 */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500/50 rounded-tl-xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500/50 rounded-br-xl" />

            <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-6 sm:p-10 rounded-2xl overflow-hidden h-full flex flex-col justify-between">
              {/* 스캔 라인 배경 */}
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(6,182,212,0.02)_50%)] bg-[size:100%_4px] pointer-events-none" />

              <div className="flex flex-col md:flex-row gap-8 relative z-10">
                {/* 아바타 영역 */}
                <div className="relative shrink-0 mx-auto md:mx-0">
                  <div className="w-32 h-32 md:w-40 md:h-40 relative flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border border-cyan-500/20 border-t-cyan-500/80 animate-[spin_10s_linear_infinite]" />
                    <div className="absolute inset-2 rounded-full border border-slate-700 border-b-slate-500 animate-[spin_7s_linear_infinite_reverse]" />

                    <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-cyan-500/50 bg-slate-950 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                      {currentUser.avatar ? (
                        <img
                          src={currentUser.avatar}
                          className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                          alt="Profile"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl md:text-5xl font-black bg-gradient-to-tr from-cyan-400 to-white bg-clip-text text-transparent">
                          {currentUser.name?.[0] ?? 'U'}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/50 via-transparent to-transparent mix-blend-overlay" />
                    </div>
                  </div>
                  <div className="text-center mt-3">
                    <span className="px-2 py-0.5 text-[9px] border border-emerald-500/30 text-emerald-400 bg-emerald-950/30 rounded font-mono uppercase tracking-widest">
                      Verified
                    </span>
                  </div>
                </div>

                {/* 텍스트 정보 영역 */}
                <div className="flex-1 text-center md:text-left space-y-4">
                  <div>
                    <h1 className="text-3xl sm:text-5xl font-black text-white italic tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                      {currentUser.name}
                    </h1>
                    <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
                      <span className="text-slate-600 text-sm font-mono tracking-widest">
                        ID_REF:
                      </span>
                      <span className="text-cyan-400 font-mono text-sm tracking-widest">
                        #{currentUser.id || 'UNREGISTERED'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase text-slate-500 tracking-widest mb-1">
                        Link Protocol
                      </span>
                      <span className="text-sm text-slate-300 font-mono truncate">
                        {currentUser.email}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase text-slate-500 tracking-widest mb-1">
                        Registration Date
                      </span>
                      <div className="flex items-center gap-2 text-sm text-slate-300 font-mono">
                        <Calendar size={12} className="text-cyan-500" />{' '}
                        2024.05.20
                      </div>
                    </div>
                  </div>

                  {/* 버튼 영역 */}
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-2">
                    {/* 1. CONFIGURE_IDENTITY 버튼 */}
                    <button
                      className="
                relative group/btn overflow-hidden rounded-xl px-5 py-2.5
                bg-gradient-to-r from-cyan-950/40 to-cyan-900/20 
                border border-cyan-500/30
                hover:bg-cyan-500/20 hover:border-cyan-400/60 
                hover:shadow-[0_0_20px_-5px_rgba(6,182,212,0.4)]
                transition-all duration-300 ease-out cursor-pointer
              "
                    >
                      <span
                        className="
                  relative z-10 flex items-center gap-2 
                  text-[10px] font-black uppercase tracking-widest 
                  text-cyan-400 group-hover/btn:text-white 
                  transition-colors duration-300 pt-0.5
                "
                      >
                        <Edit
                          size={14}
                          className="
                    /* [수정] group/btn -> group-hover/btn */
                    group-hover/btn:rotate-45 
                    group-hover/btn:scale-110
                    transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                  "
                        />
                        CONFIGURE_IDENTITY
                      </span>
                      <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-hover/btn:opacity-100 blur-[1px] transition-opacity duration-300" />
                    </button>

                    {/* 2. ACCESS_VAULT (구 LINK_WALLET) 버튼 */}
                    <button
                      className="
                relative group/btn overflow-hidden rounded-xl px-5 py-2.5
                bg-slate-950/60 
                border border-white/10
                hover:border-cyan-500/40 hover:bg-cyan-950/30
                transition-all duration-300 ease-out cursor-pointer
              "
                    >
                      <span
                        className="
                  relative z-10 flex items-center gap-2 
                  text-[10px] font-black uppercase tracking-widest 
                  text-slate-400 group-hover/btn:text-cyan-300 
                  transition-colors duration-300 pt-0.5
                "
                      >
                        <Wallet
                          size={14}
                          className="text-slate-500 group-hover/btn:text-cyan-400 transition-colors"
                        />
                        ACCESS_VAULT
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-cyan-500/5 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* --- [RIGHT] LOGISTICS NODE (주소) --- */}
          <div className="relative group flex flex-col h-full">
            {/* 상단 장식 바 */}
            <div className="h-1 w-full bg-slate-800 mb-1 overflow-hidden flex">
              <div className="h-full bg-cyan-500 w-1/3 animate-[loading_2s_ease-in-out_infinite]" />
            </div>

            <div className="border border-cyan-500/20 bg-slate-900/60 backdrop-blur-xl p-6 sm:p-8 rounded-b-3xl rounded-tr-3xl relative overflow-hidden flex-1 flex flex-col shadow-[0_0_40px_rgba(6,182,212,0.05)]">
              {/* 배경 장식 */}
              <div className="absolute right-0 top-0 p-4 opacity-20">
                <MapPin
                  size={100}
                  className="text-cyan-500"
                  strokeWidth={0.5}
                />
              </div>

              <div className="relative z-10 mb-6">
                <div className="flex items-center gap-2 mb-4 text-cyan-500">
                  <div className="w-2 h-2 bg-cyan-500 rounded-sm" />
                  <h3 className="text-lg font-black uppercase italic tracking-tight text-white">
                    Shipping Node
                  </h3>
                </div>

                <div className="space-y-4 font-mono text-sm">
                  <div className="flex justify-between items-end border-b border-dashed border-white/10 pb-2">
                    <span className="text-[10px] uppercase tracking-widest text-slate-500">
                      Coordinate Status
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-950/30 px-2 py-0.5 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      LOCKED
                    </span>
                  </div>

                  <div className="p-5 bg-gradient-to-b from-cyan-950/30 to-slate-950/50 border-l-2 border-cyan-500/40 mt-4 relative">
                    <p className="text-sm text-cyan-100/90 leading-relaxed font-mono">
                      {hasAddress
                        ? userData.profile.addresses[0]
                        : 'No shipping coordinates registered in the system.'}
                    </p>
                    <div className="absolute bottom-0 right-0 p-1">
                      <span className="text-[8px] text-cyan-700">
                        GPS-DAT-01
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-auto relative z-10">
                {/* 3. REGISTER_COORDINATES 버튼 */}
                <button className="group/btn relative w-full py-4 bg-slate-950 border border-white/10 rounded-sm text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-cyan-950/20 hover:shadow-[0_0_40px_rgba(6,182,212,0.1)] transition-all text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 overflow-hidden [clip-path:polygon(10px_0,100%_0,100%_calc(100%-10px),calc(100%-10px)_100%,0_100%,0_10px)]">
                  <span className="relative z-10 flex items-center gap-2">
                    {/* <Settings
                      size={14}
                      className="
                transition-transform duration-500

                group-hover/btn:rotate-90
                group-hover/btn:scale-110
              "
                    /> */}
                    REGISTER_COORDINATES
                  </span>
                  {/* 버튼 호버 시 지나가는 광원 효과 */}
                  <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent group-hover/btn:left-[100%] transition-all duration-700 ease-in-out" />
                </button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* --- STATUS DASHBOARD (통계) --- */}
        <motion.section
          variants={itemVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"
        >
          {/* StatusCard 컴포넌트에 넘기는 디자인은 유지하되, 전체적인 그리드 흐름만 맞춥니다 */}
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

        {/* --- RECENT OPERATIONS (주문 목록) --- */}
        <motion.section variants={itemVariants} className="space-y-6">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/20">
                <Package className="text-cyan-400" size={20} />
              </div>
              <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">
                TRANSACTION_HISTORY
              </h2>
            </div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest hidden sm:block bg-slate-900 px-3 py-1 border border-white/5 rounded">
              // Transaction_Log_v2.0
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {orders.length === 0 ? (
              <div className="p-16 text-center bg-slate-900/30 rounded-[2rem] border border-dashed border-white/10 flex flex-col items-center gap-4">
                <History className="text-slate-700" size={48} />
                <p className="text-slate-500 font-black uppercase tracking-widest text-sm">
                  No transaction data found.
                </p>
              </div>
            ) : (
              orders.map((order: any) => (
                <div
                  key={`order-${order.id}`}
                  className="group relative bg-slate-900/40 border border-white/5 p-6 rounded-[1rem] hover:border-cyan-500/30 hover:bg-slate-800/40 hover:shadow-[0_0_20px_rgba(6,182,212,0.05)] transition-all duration-300 flex flex-col md:flex-row justify-between items-center gap-6 overflow-hidden"
                >
                  {/* 왼쪽 장식 바 */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-slate-800 to-transparent group-hover:from-cyan-500 transition-colors duration-300" />

                  <div className="flex items-center gap-8 w-full md:w-auto z-10 pl-4">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-cyan-600 font-mono uppercase tracking-widest mb-1">
                        Ref_ID
                      </span>
                      <span className="text-white font-mono text-sm group-hover:text-cyan-400 transition-colors">
                        #{order.id}
                      </span>
                    </div>

                    <div className="h-8 w-px bg-white/10" />

                    <div>
                      <div className="text-2xl font-black text-white italic tracking-tight">
                        <span className="text-sm font-light text-cyan-500 mr-1">
                          $
                        </span>
                        {Number(order.total ?? 0).toLocaleString()}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest group-hover:text-slate-300">
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDetailsClick(order)}
                    className="
                      relative group/btn overflow-hidden rounded-lg
                      w-full md:w-auto cursor-pointer
                      bg-cyan-950/30
                      border border-cyan-500/20
                      hover:border-cyan-400/50 hover:bg-cyan-900/40
                      focus:outline-none transition-all duration-300
                    "
                  >
                    <div className="relative z-10 flex items-center justify-center gap-2 px-8 py-3">
                      <span
                        className="
                          text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] 
                          text-cyan-100 group/group-hover/btn:text-cyan-300 transition-colors pt-0.5
                        "
                      >
                        VIEW_MANIFEST
                      </span>
                    </div>
                    {/* 버튼 내부 스캔 효과 */}
                    <div className="absolute bottom-0 inset-x-0 h-[1px] bg-cyan-400/50 translate-y-full group/btn:translate-y-0 transition-transform duration-300" />
                  </button>
                </div>
              ))
            )}
          </div>
        </motion.section>

        {/* --- [RECOMMENDATION SECTION] (기존 디자인 유지하며 약간의 폴리싱) --- */}
        <motion.section
          variants={itemVariants}
          className="pt-12 border-t border-dashed border-white/5 relative"
        >
          {/* 섹션 배경 장식 */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-950 px-4 text-slate-700">
            <div className="w-2 h-2 rounded-full border border-slate-700" />
          </div>

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
              <div className="self-start sm:self-auto px-3 py-1 flex items-center gap-2 border border-emerald-500/20 rounded-full bg-emerald-950/10">
                <Activity
                  size={12}
                  className="animate-pulse text-emerald-500"
                />
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
                  AI_Optimized
                </span>
              </div>
            </div>

            <div className="flex gap-4 self-end sm:self-auto">
              <button
                onClick={() => scrollRecs('left')}
                className="p-3 rounded-full border border-white/10 bg-slate-900 text-cyan-400 hover:bg-cyan-500 hover:text-black hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all duration-300"
                aria-label="Scroll Left"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => scrollRecs('right')}
                className="p-3 rounded-full border border-white/10 bg-slate-900 text-cyan-400 hover:bg-cyan-500 hover:text-black hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all duration-300"
                aria-label="Scroll Right"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* ... (추천 리스트 슬라이더는 기존과 동일하게 유지) ... */}
          <div
            ref={sliderRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto overflow-y-hidden p-4 sm:p-6 snap-x scroll-smooth no-scrollbar"
          >
            {recsLoading
              ? [1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="min-w-[220px] sm:min-w-[260px] aspect-[3/4] bg-white/5 rounded-[1.25rem] animate-pulse border border-white/5 snap-center"
                  />
                ))
              : recs.map((product) => (
                  <div
                    key={`rec-${product.id}`}
                    className="group min-w-[220px] sm:min-w-[260px] snap-center h-full flex flex-col gap-3"
                  >
                    <ProductCard
                      product={product}
                      onOpen={() => {
                        setSelectedProduct(product);
                        actionMutation.mutate({
                          productId: product.id,
                          action: 'view',
                        });
                      }}
                    />

                    {product.why && (
                      <div className="sm:hidden relative pl-4 pr-2 py-1 ml-2">
                        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-cyan-500/50 via-cyan-500/10 to-transparent group-hover:from-cyan-400 group-hover:via-cyan-400/30 transition-colors duration-300" />
                        <div className="absolute left-[-2px] top-0 w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)] group-hover:scale-125 transition-transform duration-300" />
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <CornerDownRight
                              size={14}
                              className="text-cyan-600 group-hover:text-cyan-400 transition-colors duration-300"
                            />
                            <span className="text-[9px] font-black uppercase tracking-widest text-cyan-700 group-hover:text-cyan-400 transition-colors duration-300">
                              Analysis_Log
                            </span>
                          </div>
                          <p className="text-[11px] font-mono text-slate-500 leading-tight group-hover:text-cyan-100/90 transition-colors duration-300">
                            <span className="text-cyan-600/50 mr-1 group-hover:text-cyan-400 transition-colors">
                              &gt;&gt;
                            </span>
                            {getTranslatedReason(product.why)}
                          </p>
                        </div>
                      </div>
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
