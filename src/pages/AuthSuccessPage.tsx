"use client";

import { motion } from "framer-motion";
import { CheckCircle2, CircuitBoard, CreditCard, ShieldCheck, ShoppingBag, User } from "lucide-react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/store/authStore";

export default function AuthSuccessPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const displayName = user?.full_name ?? user?.email ?? "Neural Operator";

  // ✅ 핵심 로직: "Buy Now"를 통해 오지 않았다면 Home으로 리다이렉트
  // (일반 로그인은 바로 홈으로, 구매 중 로그인은 이 페이지로)
  useEffect(() => {
    if (!state?.fromBuyNow) {
      navigate("/", { replace: true });
    }
  }, [state, navigate]);

  // 리다이렉트 중 깜빡임 방지 (state가 없으면 아무것도 렌더링 안 함)
  if (!state?.fromBuyNow) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">

      {/* 배경 데코레이션 (PaymentSuccess와 통일감) */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/circuit-board.svg')] opacity-5 pointer-events-none mix-blend-screen" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="max-w-xl w-full bg-slate-900 border border-cyan-500/30 rounded-[3rem] p-8 sm:p-10 text-center shadow-[0_0_100px_rgba(6,182,212,0.1)] relative z-10"
      >
        {/* 1. 아이콘 섹션 */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-cyan-500/10 rounded-full flex items-center justify-center text-cyan-400 border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
              <ShieldCheck size={48} />
            </div>
            {/* 체크마크 배지 */}
            <div className="absolute -bottom-2 -right-2 bg-slate-950 border border-cyan-500 rounded-full p-2 text-cyan-400">
                <CheckCircle2 size={20} fill="currentColor" className="text-slate-950" />
            </div>
          </div>
        </div>

        {/* 2. 타이틀 섹션 */}
        <h1 className="text-3xl sm:text-4xl font-black italic uppercase mb-3 text-white tracking-tight">
          Identity Verified
        </h1>
        <p className="text-slate-400 font-bold mb-8 sm:mb-10 text-sm sm:text-base px-4">
          Neural link established. Your account is ready for transaction.
        </p>

        {/* 3. 정보 박스 (PaymentSuccess 디자인 계승) */}
        <div className="bg-black/40 rounded-3xl p-6 text-left space-y-4 mb-8 sm:mb-10 border border-white/5 font-mono shadow-inner">
          <div className="flex justify-between items-center text-xs border-b border-white/5 pb-3">
            <span className="text-slate-500 uppercase tracking-widest font-bold">Session Status</span>
            <span className="text-green-400 font-black bg-green-500/10 px-2 py-1 rounded border border-green-500/20">ACTIVE</span>
          </div>

          <div className="space-y-3 py-1">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400">
                    <User size={14} />
                </div>
                <div>
                    <p className="text-[10px] text-slate-500 uppercase">Authorized User</p>
                    <p className="text-sm text-white font-bold truncate">{displayName}</p>
                </div>
             </div>

             {/* 장바구니 요약 (가상의 데이터 예시) */}
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400">
                    <CircuitBoard size={14} />
                </div>
                <div>
                    <p className="text-[10px] text-slate-500 uppercase">Pending Action</p>
                    <p className="text-sm text-cyan-400 font-bold">Checkout Sequence Ready</p>
                </div>
             </div>
          </div>
        </div>

        {/* 4. 버튼 액션 그룹 */}
        <div className="space-y-3 sm:space-y-4">
            {/* 결제하기 (Primary) - 흰색 배경 */}
            <button
                onClick={() => navigate("/checkout")}
                className="w-full bg-white text-black py-4 sm:py-5 rounded-2xl font-black text-base sm:text-lg hover:bg-cyan-400 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.2)] group"
            >
                <CreditCard size={20} className="group-hover:rotate-12 transition-transform" />
                PROCEED TO PAYMENT
            </button>

            {/* 쇼핑 더 하기 (Secondary) - 투명 배경 */}
            <button
                onClick={() => navigate("/")}
                className="w-full bg-transparent border border-white/10 text-slate-400 py-4 sm:py-5 rounded-2xl font-bold text-sm sm:text-base hover:bg-white/5 hover:text-white hover:border-white/30 transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
            >
                <ShoppingBag size={18} />
                Continue Shopping
            </button>
        </div>

      </motion.div>
    </div>
  );
}
