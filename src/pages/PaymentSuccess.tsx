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
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-cyan-500/20 rounded-full flex items-center justify-center text-cyan-400">
            <CheckCircle2 size={48} />
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

        <button
          onClick={() => navigate("/")}
          className="w-full bg-white text-black py-5 rounded-2xl font-black text-lg hover:bg-cyan-400 transition-all flex items-center justify-center gap-3"
        >
          <ShoppingBag size={20} />
          CONTINUE SHOPPING
        </button>
      </motion.div>
    </div>
  );
}
