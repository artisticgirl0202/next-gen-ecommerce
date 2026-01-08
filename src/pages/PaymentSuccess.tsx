import { motion } from "framer-motion";
import { CheckCircle2, ReceiptText, ShoppingBag } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function PaymentSuccess() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // 만약 state가 없으면 메인으로 리다이렉트 (비정상 접근)
  if (!state) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><button onClick={() => navigate("/")} className="text-white underline">Back to Home</button></div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full bg-slate-900 border border-cyan-500/30 rounded-[3rem] p-10 text-center shadow-[0_0_100px_rgba(6,182,212,0.1)]"
      >
     <div className="flex justify-center mb-8 md:mb-10 relative z-10 group">

      {/* 2. 아이콘 래퍼 (반응형 크기 조절의 핵심) */}
      {/* 모바일: w-24 h-24, 태블릿/PC: w-32 h-32 로 커집니다. */}
      <div className="relative w-24 h-24 md:w-32 md:h-32 flex items-center justify-center">

        {/* [Layer 1] 배경 후광 효과 (은은하게 퍼지는 빛) */}
        {/* animate-pulse: 부드럽게 깜빡이며 생동감을 줍니다. */}
        <div className="absolute -inset-2 md:-inset-4 bg-cyan-500/40 rounded-full blur-xl animate-pulse md:group-hover:bg-cyan-400/50 transition-colors duration-500" />

        {/* [Layer 2] 회전하는 네온 테두리 (사이버펑크 핵심) */}
        {/* conic gradient를 사용하여 금속성 빛 반사 느낌을 내고 회전시킵니다. */}
        <div className="absolute inset-0 rounded-full p-[2px] overflow-hidden animate-[spin_4s_linear_infinite]">
           <div className="absolute inset-0 bg-[conic-gradient(from_90deg_at_50%_50%,#000000_0%,#06b6d4_50%,#000000_100%)]" />
        </div>

        {/* [Layer 3] 내부 배경 (테두리 안쪽 어두운 영역) */}
        {/* 테두리와 아이콘 사이의 공간을 만들어 깊이감을 줍니다. */}
        <div className="absolute inset-[3px] md:inset-[4px] rounded-full bg-slate-950/90 backdrop-blur-sm ring-1 ring-cyan-500/30" />

        {/* [Layer 4] 실제 아이콘 */}
        <div className="relative z-10 text-cyan-300 drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]">
          {/* 아이콘 크기도 반응형으로 조절 */}
          {/* 모바일: w-12 h-12 (48px), PC: w-16 h-16 (64px) */}
          <CheckCircle2 className="w-12 h-12 md:w-16 md:h-16 transition-transform duration-300 md:group-hover:scale-110" />
        </div>

      </div>
    </div>

        <h1 className="text-4xl font-black italic uppercase mb-2">Payment Complete</h1>
        <p className="text-slate-400 font-bold mb-10">Your neural integration has been successfully processed.</p>

        <div className="bg-black/40 rounded-3xl p-6 text-left space-y-4 mb-10 border border-white/5 font-mono">
          <div className="flex justify-between text-xs border-b border-white/5 pb-2">
            <span className="text-slate-500 uppercase">Order Number</span>
            <span className="text-cyan-400 font-black">{state.orderId}</span>
          </div>
          <div className="space-y-2 py-2">
            <p className="text-[10px] text-slate-500 uppercase flex items-center gap-2"><ReceiptText size={12}/> Order Items</p>
            {state.items.map((item: any) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-slate-300 truncate pr-4">{item.name} x {item.qty}</span>
                <span className="text-white">${(item.price * item.qty).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-lg font-black border-t border-white/5 pt-4">
            <span className="text-white uppercase italic">Total Paid</span>
            <span className="text-cyan-400">${state.total.toLocaleString()}</span>
          </div>
        </div>

        <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate("/")}
      className="
        group relative inline-flex items-center justify-center
        overflow-hidden rounded-full p-[1px]
        focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:ring-offset-2 focus:ring-offset-slate-950

        /* [반응형 크기 설정] */
        /* 모바일: 꽉 찬 너비로 터치 영역 확보 */
        w-full
        /* 태블릿(sm) 이상: 내용에 맞는 너비 + 최소 너비 보장 */
        sm:w-auto sm:min-w-[240px]
      "
    >
      {/* 1. 배경 애니메이션 그라디언트 (테두리 역할) */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-600 to-cyan-400 animate-[shimmer_2s_linear_infinite] bg-[length:200%_100%]" />

      {/* 2. 내부 컨텐츠 영역 */}
      <div className="
        relative w-full h-full
        bg-slate-950 group-hover:bg-slate-900/90 transition-colors duration-300
        rounded-full

        /* [반응형 패딩] 모바일에서는 터치 높이 확보(py-4), PC는 여유롭게(py-5) */
        px-6 py-4 md:px-10 md:py-5

        flex items-center justify-center gap-3
      ">
        {/* 아이콘: 원래의 ShoppingBag 유지 + 스타일 적용 */}
        <ShoppingBag
          size={20}
          className="text-cyan-500 group-hover:text-cyan-300 transition-colors duration-300 shrink-0"
        />

        {/* 텍스트 */}
        <span className="
          font-black uppercase tracking-[0.15em] text-white
          /* [반응형 폰트] 모바일: 14px, PC: 16px (가독성 확보) */
          text-sm md:text-base
          whitespace-nowrap
          group-hover:text-cyan-50 transition-colors
        ">
          Continue Shopping
        </span>
      </div>

      {/* 3. 호버 시 나타나는 글로우 효과 */}
      <div className="absolute inset-0 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.0)] group-hover:shadow-[0_0_25px_rgba(34,211,238,0.4)] transition-shadow duration-300 pointer-events-none" />
    </motion.button>
      </motion.div>
    </div>
  );
}
