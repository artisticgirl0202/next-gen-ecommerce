import { AnimatePresence, motion } from "framer-motion";

export default function CategoryMenu({
  open,
  onClose,
  categories,
}: {
  open: boolean;
  onClose: () => void;
  categories: string[];
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* underlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
            onClick={onClose}
          />

          {/* menu panel */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="absolute left-4 top-14 z-50 w-72 sm:w-96 bg-gradient-to-b from-slate-900/95 to-slate-950 border border-white/5 rounded-2xl p-4 shadow-[0_30px_80px_rgba(2,12,23,0.6)]"
          >
            <div className="mb-3 text-xs text-slate-400 uppercase tracking-widest">Select Sector</div>
            <div className="grid grid-cols-1 gap-2 max-h-72 overflow-auto no-scrollbar">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    // 실제로는 라우터 이동 or 필터 호출을 연결하세요
                    console.log("category selected", c);
                    onClose();
                  }}
                  className="text-left p-3 rounded-lg hover:bg-white/5 transition flex items-center gap-3"
                >
                  <span className="w-2 h-2 bg-cyan-400 rounded-full" />
                  <span className="text-sm text-white font-bold">{c}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
