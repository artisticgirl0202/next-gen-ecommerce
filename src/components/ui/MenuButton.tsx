import { useState } from "react";
import CategoryMenu from "./CategoryMenu";

export default function MenuButton({ categories }: { categories: string[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((s) => !s)}
        aria-expanded={open}
        className="p-3 rounded-xl bg-slate-900/40 border border-white/5 text-cyan-400 hover:bg-cyan-500/10 transition shadow-[0_10px_30px_rgba(6,182,212,0.06)]"
      >
        {/* icon (grid) */}
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <rect x="3" y="3" width="8" height="8" rx="2"></rect>
          <rect x="13" y="3" width="8" height="8" rx="2"></rect>
          <rect x="3" y="13" width="8" height="8" rx="2"></rect>
          <rect x="13" y="13" width="8" height="8" rx="2"></rect>
        </svg>
      </button>

      {/* CategoryMenu: absolute dropdown / modal */}
      <CategoryMenu open={open} onClose={() => setOpen(false)} categories={categories} />
    </div>
  );
}
