// src/pages/CartPage.tsx
'use client';

import { useCart } from '@/store/cartStore';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  Cpu,
  LayoutGrid,
  Minus,
  Plus,
  ShieldCheck,
  Trash2,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CartPage({ onBack }: { onBack?: () => void }) {
  const navigate = useNavigate();
  const { items, updateQty, removeItem } = useCart();

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = subtotal > 500 ? 0 : 25;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen text-slate-200 selection:bg-cyan-500/30 relative font-sans bg-slate-950">
      {/* Background */}
      <div className="fixed inset-0 bg-[url('/circuit-board.svg')] bg-center opacity-5 mix-blend-screen pointer-events-none" />

      {/* Main Container: Mobile(px-4) -> Tablet(px-6) -> PC(px-8) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-14 relative z-10">
        {/* HEADER SECTION */}
        {/* Layout: Mobile(Col) -> Tablet/PC(Row) */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-12 lg:mb-16">
          <div className="flex items-start gap-4 sm:gap-6">
            {/* Back Button: Mobile(w-10) -> Tablet/PC(w-12) */}
            <button
              onClick={() => (onBack ? onBack() : navigate(-1))}
              className="group relative flex items-center justify-center
                         w-10 h-10 sm:w-12 sm:h-12
                         transition-all duration-300 cursor-pointer flex-shrink-0
                         border border-white/10 rounded-full hover:bg-cyan-500/20 hover:border-cyan-500/30"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400 group-hover:text-cyan-300 transition-colors" />
            </button>

            <div className="flex flex-col">
              {/* Badge Area */}
              <div className="flex items-center gap-3 mb-2 sm:mb-3">
                <span className="text-cyan-400 text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase px-2 sm:px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-md flex items-center gap-2">
                  <Cpu className="w-3 h-3 sm:w-4 sm:h-4" /> System // Cartlog.v3
                </span>
              </div>

              {/* Title: Mobile(3xl) -> Tablet(5xl) -> PC(7xl) */}
              <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-white italic tracking-tighter uppercase leading-[0.9]">
                Command Center
              </h1>

              {/* Subtitle */}
              <p className="text-cyan-500/60 font-mono text-[10px] sm:text-sm uppercase tracking-tighter mt-2 pl-1">
                Active Modules: {items.length} Units
              </p>
            </div>
          </div>
        </header>

        {items.length === 0 ? (
          <EmptyState navigate={navigate} />
        ) : (
          /* Grid Layout: Mobile(Col) -> PC(Row split) */
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
            {/* LEFT COLUMN: Cart Items List */}
            <div className="flex-1 w-full space-y-4">
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="group relative bg-white/[0.02] border border-white/5 p-4 sm:p-6 rounded-3xl overflow-hidden transition-all duration-300 hover:border-cyan-500/30 hover:bg-white/[0.04]"
                  >
                    <div className="flex flex-col sm:flex-row gap-5 sm:gap-6">
                      {/* Product Image: Mobile(Full Width) -> Tablet(Fixed Width) */}
                      <div className="relative w-full sm:w-32 lg:w-40 aspect-square flex-shrink-0 rounded-2xl overflow-hidden bg-slate-900 border border-white/5 group-hover:border-cyan-500/20 transition-colors">
                        <img
                          src={item.image}
                          className="w-full h-full object-cover p-2 mix-blend-overlay opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                          alt={item.title}
                        />
                        <img
                          src={item.image}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          alt={item.title}
                        />
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 flex flex-col justify-between min-h-[auto] sm:min-h-[128px]">
                        <div>
                          <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic mb-1">
                                ID: {item.id.toString().padStart(4, '0')}
                              </span>
                              {/* Item Title: Responsive Text */}
                              <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-white uppercase italic tracking-tighter leading-tight mb-2 pr-8">
                                {item.title}
                              </h3>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-slate-600 hover:text-red-400 transition-colors p-2 -mr-2 -mt-2"
                              title="Remove Module"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>

                          <div className="flex items-baseline gap-1 text-2xl font-black text-white">
                            <span className="text-sm font-light text-cyan-500">
                              $
                            </span>
                            {item.price.toLocaleString()}
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-6 mt-4 pt-4 border-t border-white/5">
                          <div className="flex items-center gap-3 bg-slate-950/50 rounded-xl p-1 border border-white/10">
                            <button
                              onClick={() => updateQty(item.id, -1)}
                              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                            >
                              <Minus size={14} />
                            </button>

                            <span className="font-mono font-bold text-white w-6 text-center text-sm">
                              {item.qty}
                            </span>

                            <button
                              onClick={() => updateQty(item.id, 1)}
                              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg hover:bg-white/10 text-cyan-400 transition-all drop-shadow-[0_0_8px_rgba(6,182,212,0.6)] hover:drop-shadow-[0_0_12px_rgba(34,211,238,1)]"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <div className="text-[10px] font-mono text-cyan-500/70 uppercase tracking-widest hidden sm:block">
                            STATUS: ACTIVE
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* RIGHT COLUMN: Summary Panel */}
            {/* Width: Mobile(Full) -> PC(Fixed 400px) */}
            <div className="w-full lg:w-[400px] flex-shrink-0 lg:sticky lg:top-10">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-400/80 rounded-[2rem] shadow-[0_0_50px_rgba(6,182,212,0.1)] p-6 sm:p-8 relative overflow-hidden"
              >
                {/* Decorative header line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-50" />

                <h2 className="text-lg sm:text-xl font-black text-white uppercase italic tracking-tighter mb-6 sm:mb-8 flex items-center gap-2">
                  <Zap size={20} className="text-cyan-500 fill-cyan-500" />
                  Order Summary
                </h2>

                {/* Specs/Cost Grid */}
                <div className="space-y-4 mb-8">
                  <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex justify-between items-center">
                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">
                      Subtotal
                    </span>
                    <span className="text-sm text-cyan-100 font-bold font-mono">
                      ${subtotal.toLocaleString()}
                    </span>
                  </div>

                  <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex justify-between items-center">
                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">
                      Quantum Ship
                    </span>
                    <span className="text-sm font-bold font-mono">
                      {shipping === 0 ? (
                        <span className="text-emerald-400">FREE</span>
                      ) : (
                        `$${shipping}`
                      )}
                    </span>
                  </div>

                  <div className="py-4 border-t border-white/10 mt-2 flex justify-between items-end">
                    <span className="text-xs text-white uppercase font-black tracking-[0.2em]">
                      Total Core
                    </span>
                    <div className="flex items-baseline gap-1 text-2xl sm:text-3xl font-black text-white">
                      <span className="text-lg font-light text-cyan-500">
                        $
                      </span>
                      {total.toLocaleString()}
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => navigate('/checkout')}
                  className="
    /* [수정 1] inline-flex를 flex로 변경하고, mx-auto(가로 중앙 정렬) 추가 */
    group relative flex mx-auto items-center justify-center
    
    overflow-hidden rounded-full p-[1px]
    focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:ring-offset-2 focus:ring-offset-slate-950

    /* 반응형 크기 설정 */
    w-full sm:w-auto sm:min-w-[240px] md:min-w-[300px]
  "
                >
                  {/* 1. 배경 애니메이션 그라디언트 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-600 to-cyan-400 animate-[shimmer_2s_linear_infinite] bg-[length:200%_100%]" />

                  {/* 2. 내부 컨텐츠 영역 */}
                  <div
                    className="
      relative w-full h-full
      bg-slate-950
      group-hover:bg-cyan-950/30
      transition-colors duration-300
      rounded-full

      /* 패딩 및 레이아웃 */
      px-6 py-4 md:px-10 md:py-6
      flex items-center justify-center gap-3
      backdrop-blur-sm
    "
                  >
                    <ShieldCheck
                      size={20}
                      className="text-cyan-500 group-hover:text-white transition-colors duration-300"
                    />

                    <span
                      className="
        font-black uppercase tracking-[0.2em] text-white
        text-xs md:text-sm
        whitespace-nowrap
        group-hover:text-cyan-50 transition-colors
        group-hover:drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]
      "
                    >
                      Initiate Checkout
                    </span>
                  </div>

                  {/* 3. 호버 시 글로우(Glow) 효과 */}
                  <div className="absolute inset-0 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.0)] group-hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-shadow duration-300 pointer-events-none" />
                </motion.button>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ navigate }: { navigate: (path: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 sm:py-32 backdrop-blur-sm px-4"
    >
      <div
        className="
        group relative flex items-center justify-center
        w-16 h-16 mb-6 sm:mb-8
        rounded-full border border-cyan-500/40 bg-cyan-950/30 backdrop-blur-md
        shadow-[0_0_20px_rgba(6,182,212,0.3)]
        transition-all duration-300
        hover:border-cyan-400/80
        hover:shadow-[0_0_35px_rgba(6,182,212,0.5)]
      "
      >
        <div className="absolute top-2 right-2 w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
        <Cpu
          size={30}
          className="relative z-10 text-cyan-400 transition-all duration-300
                   group-hover:text-cyan-200 group-hover:drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]"
        />
        <div className="absolute inset-0 rounded-full border border-dashed border-cyan-500/20 animate-[spin_10s_linear_infinite] group-hover:border-cyan-500/40" />
      </div>

      <h2 className="text-xl sm:text-2xl font-black text-white mb-2 tracking-[0.2em] uppercase italic text-center">
        System Idle
      </h2>
      <p className="text-slate-500 mb-8 sm:mb-10 font-mono text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-center px-4 max-w-md">
        No active data stream detected in cart.
      </p>

      <motion.button
        whileHover={{ scale: 1.02 }}
        onClick={() => navigate('/')}
        className="
    group relative inline-flex items-center justify-center
    overflow-hidden rounded-full p-[1px]
    focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:ring-offset-2 focus:ring-offset-slate-950

    /* 반응형 크기 설정 */
    w-full sm:w-auto min-w-[200px] md:min-w-[260px]
  "
      >
        {/* 1. 배경 애니메이션 그라디언트 (회전하는 빛 효과) */}
        {/* Cyan(하늘색) -> Blue(파란색) -> Cyan 순환 */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-cyan-500/40 to-cyan-400 animate-[shimmer_2s_linear_infinite] bg-[length:200%_100%]" />

        {/* 2. 내부 컨텐츠 영역 (검은 배경으로 가운데를 가림) */}
        <div
          className="
    relative w-full h-full
    bg-slate-950  group-hover:bg-cyan-950/30 transition-colors duration-300
    rounded-full

    /* 패딩 및 레이아웃 */
    px-6 py-4 md:px-10 md:py-6
    flex items-center justify-center gap-3 md:gap-4
    backdrop-blur-sm
  "
        >
          {/* 아이콘: Store Grid의 의미를 담은 아이콘 */}
          <LayoutGrid
            size={18}
            className="text-cyan-500 group-hover:text-white transition-colors duration-300"
          />

          {/* 텍스트 */}
          <span
            className="
      font-black uppercase tracking-[0.2em] text-white
      text-[10px] sm:text-xs md:text-sm
      whitespace-nowrap
      group-hover:text-cyan-50 transition-colors
      group-hover:drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]
    "
          >
            Access Store Grid
          </span>
        </div>

        {/* 3. 호버 시 글로우(Glow) 효과 */}
        <div className="absolute inset-0 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.0)] group-hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-shadow duration-300 pointer-events-none" />
      </motion.button>
    </motion.div>
  );
}
