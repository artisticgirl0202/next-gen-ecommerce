import { AnimatePresence, motion } from "framer-motion";
import { RefreshCcw, ShieldCheck } from "lucide-react";
import { useState } from "react";

export default function AuthOverlay({
  isLoggingOut,
  showVerify,
  onVerify
}: {
  isLoggingOut: boolean;
  showVerify: boolean;
  onVerify: (code: string) => void
}) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);

  // 1. 로그아웃 셧다운 효과 (화면이 암전됨)
  if (isLoggingOut) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center"
      >
        <motion.div
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="text-cyan-500 font-mono text-xl"
        >
          SYSTEM SHUTTING DOWN...
        </motion.div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      {showVerify && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[500] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          {/* 2. 이메일 인증 화려한 UI */}
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-slate-900 border border-cyan-500/30 p-8 rounded-[2.5rem] max-w-md w-full shadow-[0_0_50px_rgba(6,182,212,0.2)] text-center"
          >
            <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-cyan-500/20">
              <ShieldCheck className="text-cyan-400" size={32} />
            </div>

            <h2 className="text-2xl font-black text-white mb-2 italic uppercase">Verify Neural-ID</h2>
            <p className="text-slate-400 text-sm mb-8">Enter the 6-digit code sent to your terminal.</p>

            <div className="flex justify-between gap-2 mb-8">
  {code.map((num, i) => (
    <input
      key={i}
      id={`code-${i}`} // id 추가
      type="text"
      maxLength={1}
      className="w-12 h-14 bg-black border border-white/10 rounded-xl text-center text-xl font-bold text-cyan-400 focus:border-cyan-500 outline-none transition-all"
      value={num}
      onChange={(e) => {
        const value = e.target.value;
        const newCode = [...code];
        newCode[i] = value;
        setCode(newCode);

        // 번호 입력 시 자동으로 다음 칸 이동
        if (value && i < 5) {
          const nextInput = document.getElementById(`code-${i + 1}`);
          nextInput?.focus();
        }
      }}
      onKeyDown={(e) => {
        // 백스페이스 시 이전 칸 이동
        if (e.key === "Backspace" && !code[i] && i > 0) {
          const prevInput = document.getElementById(`code-${i - 1}`);
          prevInput?.focus();
        }
      }}
    />
  ))}
</div>

            <button
              onClick={() => onVerify(code.join(""))}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-4 rounded-xl font-black transition-all shadow-[0_10px_20px_rgba(8,145,178,0.3)] mb-6 uppercase"
            >
              Confirm Authorization
            </button>

            <button className="flex items-center justify-center gap-2 text-xs text-slate-500 hover:text-cyan-400 mx-auto transition-colors uppercase font-bold tracking-widest">
              <RefreshCcw size={14} /> Resend Signal (02:59)
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
