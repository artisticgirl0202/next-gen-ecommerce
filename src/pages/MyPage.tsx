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
  Settings,
  Sparkles,
  Truck,
  UserCircle2,
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
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-3 text-slate-500 hover:text-cyan-400 transition-colors w-fit"
        >
          <div className="p-3 bg-white/5 backdrop-blur-sm border border-white/10 text-cyan-400 rounded-full hover:bg-cyan-500/20 hover:border-cyan-500/30 transition-all shadow-lg">
            <ArrowLeft size={20} />
          </div>
        </button>

        <motion.section
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <div className="lg:col-span-2 space-y-6">
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
                  {currentUser.id && (
                    <span className="text-slate-600"> #{currentUser.id}</span>
                  )}
                </h1>
              </div>

              <div className="text-right md:text-left">
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

              <div className="pt-4 flex flex-wrap gap-3">
                <button
                  className="
                    relative group overflow-hidden rounded-xl px-5 py-2.5
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
                      text-cyan-400 group-hover:text-white 
                      transition-colors duration-300 pt-0.5
                    "
                  >
                    <Edit
                      size={14}
                      className="
                        group-hover:rotate-45 
                        group-hover:scale-110
                        transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                      "
                    />
                    Update_Profile
                  </span>
                  <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-hover:opacity-100 blur-[1px] transition-opacity duration-300" />
                </button>

                <button
                  className="
                    relative group overflow-hidden rounded-xl px-5 py-2.5
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
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-cyan-500/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                </button>
              </div>
            </motion.div>
          </div>

          <div className="border border-cyan-500/20 rounded-3xl p-6 sm:p-8 relative overflow-hidden bg-slate-900/40 backdrop-blur-xl shadow-[0_0_40px_rgba(6,182,212,0.05)] flex flex-col justify-between">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

            <div>
              <h3 className="text-lg font-black text-white uppercase italic tracking-tight mb-6 flex items-center gap-2">
                <MapPin className="text-cyan-500" size={18} /> Shipping
                Destination
              </h3>

              <div className="space-y-3 mb-6 font-mono text-sm">
                <div className="flex justify-between text-slate-400 text-[10px] tracking-widest uppercase">
                  <span>Current Node</span>
                  <span className="text-emerald-400 italic font-bold">
                    Active Link
                  </span>
                </div>
                <div className="h-px bg-white/10 my-2" />

                <div className="p-4 bg-cyan-950/20 border border-cyan-500/10 rounded-xl">
                  <p className="text-sm text-cyan-100/80 leading-relaxed font-mono">
                    {hasAddress
                      ? userData.profile.addresses[0]
                      : 'No shipping coordinates registered.'}
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
              // [수정] index 파라미터 제거
              orders.map((order: any) => (
                <div
                  key={`order-${order.id}`}
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
                    onClick={() => handleDetailsClick(order)}
                    className="
                      relative group/btn overflow-hidden rounded-lg sm:rounded-xl
                      w-full md:w-auto cursor-pointer
                      bg-gradient-to-r from-cyan-900/20 to-cyan-800/20
                      border border-cyan-500/20
                      hover:border-cyan-400/50 hover:from-cyan-500/10 hover:to-cyan-400/20
                      focus:outline-none transition-all duration-300
                    "
                  >
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
                    <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 blur-[2px]" />
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
                        console.log(
                          '📡 Event Triggered via Mutation:',
                          product.name,
                        );
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
