
// // next-gen-ecommerce/src/components/layout/Header.tsx
// "use client";

// import { CATEGORIES } from "@/data/categoryData";
// import { AnimatePresence, motion } from "framer-motion";
// import {
//   ArrowUpDown,
//   ChevronLeft,
//   ChevronRight,
//   LayoutGrid,
//   List,
//   Menu,
//   X
// } from "lucide-react";
// import { useEffect, useRef, useState } from "react";

// /** 브랜드 옵션 */
// const BRAND_OPTIONS = ["Eco", "NextGen", "BioTech", "AudioX", "Vision", "Optic", "Input", "Cyber", "Unity", "Signal", "Core", "Medical", "Mind"];

// interface HeaderProps {
//   onCategorySelect: (category: string) => void;
//   activeCategory: string;

//   viewMode?: "grid" | "list";
//   onViewModeChange?: (mode: "grid" | "list") => void;

//   sortBy?: "newest" | "price_low" | "price_high";
//   onSortChange?: (sort: "newest" | "price_low" | "price_high") => void;

//   brands: string[];
//   onBrandsChange: (brands: string[]) => void;
// }

// export default function Header({
//   onCategorySelect,
//   activeCategory,
//   viewMode = "grid",
//   onViewModeChange,
//   sortBy = "newest",
//   onSortChange,
//   brands = [],
//   onBrandsChange = () => {}
// }: HeaderProps) {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [showLeftArrow, setShowLeftArrow] = useState(false);
//   const [showRightArrow, setShowRightArrow] = useState(false);

//   const scrollRef = useRef<HTMLDivElement>(null);

//   const checkScroll = () => {
//     if (!scrollRef.current) return;
//     const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
//     setShowLeftArrow(scrollLeft > 10);
//     setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
//   };

//   useEffect(() => {
//     checkScroll();
//     window.addEventListener("resize", checkScroll);
//     return () => window.removeEventListener("resize", checkScroll);
//   }, []);

//   const scrollBy = (dir: "left" | "right") => {
//     scrollRef.current?.scrollBy({
//       left: dir === "left" ? -300 : 300,
//       behavior: "smooth"
//     });
//   };

//   const toggleBrand = (brand: string) => {
//     onBrandsChange(
//       brands.includes(brand)
//         ? brands.filter(b => b !== brand)
//         : [...brands, brand]
//     );
//   };

//   return (
//     <header className="fixed top-20 left-0 w-full z-[100] bg-slate-950/90 backdrop-blur-xl border-b border-white/10 select-none shadow-2xl shadow-black/50">
//       <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
//         {/* Header 높이를 h-20에서 h-16으로 줄여 더 날렵하게 만듦 */}

//         {/* LEFT: VIEW MODE */}
//         <div className="flex items-center bg-black/40 border border-white/5 rounded-lg p-1 gap-1">
//           <button
//             onClick={() => onViewModeChange?.("grid")}
//             className={`p-1.5 rounded-md transition-all duration-300 ${
//               viewMode === "grid"
//                 ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
//                 : "text-slate-600 hover:text-slate-200"
//             }`}
//           >
//             <LayoutGrid size={16} />
//           </button>
//           <button
//             onClick={() => onViewModeChange?.("list")}
//             className={`p-1.5 rounded-md transition-all duration-300 ${
//               viewMode === "list"
//                 ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
//                 : "text-slate-600 hover:text-slate-200"
//             }`}
//           >
//             <List size={16} />
//           </button>
//         </div>

//         {/* CENTER: CATEGORY NAV */}
//         <nav className="hidden md:flex flex-1 relative overflow-hidden h-full items-center">
//           <AnimatePresence>
//             {showLeftArrow && (
//               <motion.div
//                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//                 className="absolute left-0 z-30 h-full w-16 flex items-center bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent"
//               >
//                 <button onClick={() => scrollBy("left")} className="p-1 text-cyan-500 hover:text-cyan-300 transition-colors">
//                   <ChevronLeft size={20} />
//                 </button>
//               </motion.div>
//             )}
//           </AnimatePresence>

//           <div
//             ref={scrollRef}
//             onScroll={checkScroll}
//             onWheel={e => (scrollRef.current!.scrollLeft += e.deltaY)}
//             className="w-full overflow-x-auto overflow-y-hidden no-scrollbar flex items-center h-full"
//           >
//             <div className="flex gap-2 px-8 items-center h-full">
//               {CATEGORIES.map(cat => (
//                 <button
//                   key={cat}
//                   onClick={() => onCategorySelect(cat)}
//                   className={`
//                     relative px-5 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase border transition-all duration-300 ease-out whitespace-nowrap
//                     ${activeCategory === cat
//                       ? "bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.6)] scale-100 ring-2 ring-cyan-500/20"
//                       : "bg-white/5 text-slate-500 border-white/5 hover:border-cyan-500/30 hover:text-cyan-400 hover:bg-cyan-950/30 hover:shadow-[0_0_10px_rgba(6,182,212,0.15)]"}
//                   `}
//                 >
//                   {cat}
//                 </button>
//               ))}
//             </div>
//           </div>

//           <AnimatePresence>
//             {showRightArrow && (
//               <motion.div
//                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//                 className="absolute right-0 z-30 h-full w-16 flex items-center justify-end bg-gradient-to-l from-slate-950 via-slate-950/80 to-transparent"
//               >
//                 <button onClick={() => scrollBy("right")} className="p-1 text-cyan-500 hover:text-cyan-300 transition-colors">
//                   <ChevronRight size={20} />
//                 </button>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </nav>

//         {/* RIGHT: SORT + BRAND */}
//         <div className="flex items-center gap-3">

//           {/* SORT DROPDOWN */}
//           <div className="relative group hidden lg:block">
//             <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 border border-white/10 hover:border-cyan-500/30 rounded-full text-[10px] text-slate-400 hover:text-cyan-400 uppercase tracking-wider transition-all">
//               <ArrowUpDown size={12} />
//               <span>{sortBy.replace("_", " ")}</span>
//             </button>
//             {/* 드롭다운 연결 다리 역할 (pt-2) */}
//             <div className="absolute right-0 top-full pt-2 w-40 opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-200 z-50">
//               <div className="bg-slate-950/95 backdrop-blur-md border border-white/10 rounded-xl p-1 shadow-xl shadow-black/80 ring-1 ring-white/5">
//                 {["newest", "price_low", "price_high"].map(s => (
//                   <button
//                     key={s}
//                     onClick={() => onSortChange?.(s as any)}
//                     className="w-full px-3 py-2 text-left text-[9px] font-medium uppercase tracking-wider text-slate-400 hover:text-cyan-300 hover:bg-white/5 rounded-lg transition-colors"
//                   >
//                     {s.replace("_", " ")}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* BRAND FILTER DROPDOWN */}
//           <div className="relative group hidden lg:block">
//             <button className="px-4 py-1.5 bg-slate-900/50 border border-white/10 hover:border-cyan-500/30 rounded-full text-[10px] text-slate-400 hover:text-cyan-400 uppercase tracking-wider transition-all">
//               Brand
//             </button>
//             {/* 드롭다운 연결 다리 역할 (pt-2) */}
//             <div className="absolute right-0 top-full pt-2 w-64 opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-200 z-50">
//               <div className="bg-slate-950/95 backdrop-blur-md border border-white/10 rounded-xl p-2 shadow-xl shadow-black/80 ring-1 ring-white/5">
//                 <div className="grid grid-cols-2 gap-1">
//                   {BRAND_OPTIONS.map(brand => {
//                     const active = brands.includes(brand);
//                     return (
//                       <button
//                         key={brand}
//                         onClick={() => toggleBrand(brand)}
//                         className={`flex items-center justify-between px-3 py-2 text-[9px] font-bold uppercase tracking-wider rounded-lg border transition-all
//                           ${active
//                             ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
//                             : "bg-transparent text-slate-500 border-transparent hover:bg-white/5 hover:text-cyan-200"}`}
//                       >
//                         {brand} {active && <div className="w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_5px_cyan]" />}
//                       </button>
//                     );
//                   })}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* MOBILE MENU BUTTON */}
//           <button
//             className="md:hidden p-2 bg-slate-900 border border-white/10 rounded-lg text-cyan-400 hover:bg-slate-800 transition-colors"
//             onClick={() => setIsMenuOpen(v => !v)}
//           >
//             {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
//           </button>
//         </div>
//       </div>

//       {/* MOBILE / TABLET PANEL */}
//       <AnimatePresence>
//         {isMenuOpen && (
//           <>
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               className="fixed inset-0 top-[calc(4rem+1px)] bg-slate-950/60 backdrop-blur-sm z-40"
//               onClick={() => setIsMenuOpen(false)}
//             />
//             <motion.div
//               initial={{ x: "100%" }}
//               animate={{ x: 0 }}
//               exit={{ x: "100%" }}
//               transition={{ type: "spring", damping: 25, stiffness: 200 }}
//               className="fixed right-0 top-[calc(4rem+0.px)] h-[calc(100vh-5rem)] w-[85%] max-w-[320px] bg-slate-950 border-l border-white/10 p-5 overflow-y-auto z-50 shadow-2xl"
//             >
//               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500 mb-4 opacity-70">Categories</p>
//               <div className="flex flex-wrap gap-2 mb-8">
//                 {CATEGORIES.map(cat => (
//                   <button
//                     key={cat}
//                     onClick={() => onCategorySelect(cat)}
//                     className={`
//                       px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all
//                       ${activeCategory === cat
//                         ? "bg-cyan-500 text-black border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
//                         : "bg-white/5 text-slate-400 border-white/5 hover:border-cyan-500/30 hover:text-cyan-300"}
//                     `}
//                   >
//                     {cat}
//                   </button>
//                 ))}
//               </div>

//               <div className="border-t border-white/10 pt-6">
//                 <div className="flex items-center justify-between mb-4">
//                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500 opacity-70">Brands</p>
//                    <span className="text-[9px] text-slate-500">{brands.length} selected</span>
//                 </div>

//                 <div className="grid grid-cols-2 gap-2">
//                   {BRAND_OPTIONS.map(brand => {
//                     const active = brands.includes(brand);
//                     return (
//                       <button
//                         key={brand}
//                         onClick={() => toggleBrand(brand)}
//                         className={`px-3 py-2.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition-all
//                           ${active
//                             ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/50"
//                             : "bg-slate-900 text-slate-500 border-slate-800"}
//                         `}
//                       >
//                         {brand}
//                       </button>
//                     );
//                   })}
//                 </div>
//               </div>
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>
//     </header>
//   );
// }
// next-gen-ecommerce/src/components/layout/Header.tsx
"use client";

import { CATEGORIES } from "@/data/categoryData";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpDown,
  Check,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Menu,
  X
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

/** 브랜드 옵션 */
const BRAND_OPTIONS = ["Eco", "NextGen", "BioTech", "AudioX", "Vision", "Optic", "Input", "Cyber", "Unity", "Signal", "Core", "Medical", "Mind"];

/** 정렬 옵션 매핑 */
const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
] as const;

interface HeaderProps {
  onCategorySelect: (category: string) => void;
  activeCategory: string;

  viewMode?: "grid" | "list";
  onViewModeChange?: (mode: "grid" | "list") => void;

  sortBy?: "newest" | "price_low" | "price_high";
  onSortChange?: (sort: "newest" | "price_low" | "price_high") => void;

  brands: string[];
  onBrandsChange: (brands: string[]) => void;
}

export default function Header({
  onCategorySelect,
  activeCategory,
  viewMode = "grid",
  onViewModeChange,
  sortBy = "newest",
  onSortChange,
  brands = [],
  onBrandsChange = () => {}
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftArrow(scrollLeft > 10);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  const scrollBy = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -300 : 300,
      behavior: "smooth"
    });
  };

  const toggleBrand = (brand: string) => {
    onBrandsChange(
      brands.includes(brand)
        ? brands.filter(b => b !== brand)
        : [...brands, brand]
    );
  };

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isMenuOpen]);

  return (
    <header className="fixed top-20 left-0 w-full z-[100] bg-slate-950/90 backdrop-blur-xl border-b border-white/10 select-none shadow-2xl shadow-black/50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">

        {/* LEFT: VIEW MODE (데스크탑/모바일 공용) */}
        <div className="flex items-center bg-black/40 border border-white/5 rounded-lg p-1 gap-1">
          <button
            onClick={() => onViewModeChange?.("grid")}
            className={`p-1.5 rounded-md transition-all duration-300 ${
              viewMode === "grid"
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                : "text-slate-600 hover:text-slate-200"
            }`}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => onViewModeChange?.("list")}
            className={`p-1.5 rounded-md transition-all duration-300 ${
              viewMode === "list"
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                : "text-slate-600 hover:text-slate-200"
            }`}
          >
            <List size={16} />
          </button>
        </div>

        {/* CENTER: CATEGORY NAV (모바일에서 숨김) */}
        <nav className="hidden md:flex flex-1 relative overflow-hidden h-full items-center">
          <AnimatePresence>
            {showLeftArrow && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute left-0 z-30 h-full w-16 flex items-center bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent"
              >
                <button onClick={() => scrollBy("left")} className="p-1 text-cyan-500 hover:text-cyan-300 transition-colors">
                  <ChevronLeft size={20} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div
            ref={scrollRef}
            onScroll={checkScroll}
            onWheel={e => (scrollRef.current!.scrollLeft += e.deltaY)}
            className="w-full overflow-x-auto overflow-y-hidden no-scrollbar flex items-center h-full"
          >
            <div className="flex gap-2 px-8 items-center h-full">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => onCategorySelect(cat)}
                  className={`
                    relative px-5 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase border transition-all duration-300 ease-out whitespace-nowrap
                    ${activeCategory === cat
                      ? "bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.6)] scale-100 ring-2 ring-cyan-500/20"
                      : "bg-white/5 text-slate-500 border-white/5 hover:border-cyan-500/30 hover:text-cyan-400 hover:bg-cyan-950/30 hover:shadow-[0_0_10px_rgba(6,182,212,0.15)]"}
                  `}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {showRightArrow && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute right-0 z-30 h-full w-16 flex items-center justify-end bg-gradient-to-l from-slate-950 via-slate-950/80 to-transparent"
              >
                <button onClick={() => scrollBy("right")} className="p-1 text-cyan-500 hover:text-cyan-300 transition-colors">
                  <ChevronRight size={20} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* RIGHT: SORT + BRAND (control visibility at >= 766px via component CSS) */}
        <div className="flex items-center gap-3">

          {/* Note: removed Tailwind 'hidden lg:block' so visibility is controlled by the scoped style below */}

          <div className="category-right-wrapper">
            <style>{`
              /* component-scoped header right controls
                 visible at viewport width >= 766px (user request)
              */
              .category-right-header {
                display: none;
                gap: 0.5rem;
                align-items: center;
              }

              @media (min-width: 766px) {
                .category-right-header {
                  display: flex;
                }
              }

              /* dropdown transform origin tweak */
              .category-right-header .dropdown-panel {
                transform-origin: top right;
              }
            `}</style>

            <div className="category-right-header">

              {/* SORT DROPDOWN */}
              <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 border border-white/10 hover:border-cyan-500/30 rounded-full text-[10px] text-slate-400 hover:text-cyan-400 uppercase tracking-wider transition-all">
                  <ArrowUpDown size={12} />
                  <span>{sortBy.replace("_", " ")}</span>
                </button>

                <div className="absolute right-0 top-full pt-2 w-40 opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-200 z-50 dropdown-panel">
                  <div className="bg-slate-950/95 backdrop-blur-md border border-white/10 rounded-xl p-1 shadow-xl shadow-black/80 ring-1 ring-white/5">
                    {SORT_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => onSortChange?.(opt.value)}
                        className="w-full px-3 py-2 text-left text-[9px] font-medium uppercase tracking-wider text-slate-400 hover:text-cyan-300 hover:bg-white/5 rounded-lg transition-colors"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* BRAND FILTER */}
              <div className="relative group">
                <button
                  type="button"
                  className="px-4 py-1.5 bg-slate-900/50 border border-white/10 hover:border-cyan-500/30 rounded-full text-[10px] text-slate-400 hover:text-cyan-400 uppercase tracking-wider transition-all"
                >
                  Brand
                </button>

                <div className="absolute right-0 top-full pt-2 w-64 opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-200 z-50 dropdown-panel">
                  <div className="bg-slate-950/95 backdrop-blur-md border border-white/10 rounded-xl p-2 shadow-xl shadow-black/80 ring-1 ring-white/5">
                    <div className="grid grid-cols-2 gap-1">
                      {BRAND_OPTIONS.map((brand) => {
                        const active = brands.includes(brand);
                        return (
                          <button
                            key={brand}
                            onClick={() => toggleBrand(brand)}
                            className={`flex items-center justify-between px-3 py-2 text-[9px] font-bold uppercase tracking-wider rounded-lg border transition-all
                              ${active
                                ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                                : "bg-transparent text-slate-500 border-transparent hover:bg-white/5 hover:text-cyan-200"}`}
                          >
                            {brand}
                            {active && <div className="w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_5px_cyan]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            className="md:hidden p-2 bg-slate-900 border border-white/10 rounded-lg text-cyan-400 hover:bg-slate-800 transition-colors"
            onClick={() => setIsMenuOpen(v => !v)}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* MOBILE / TABLET PANEL (모바일 메뉴 전체 영역) */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 top-[calc(4rem+1px)] bg-slate-950/60 backdrop-blur-sm z-40"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-[calc(4rem+0.4px)] h-[calc(100vh-4rem)] w-[85%] max-w-[320px] bg-slate-950 pb-25 border-l border-white/10 p-5 overflow-y-auto z-50 shadow-2xl"
            >

              {/* 1. VIEW & SORT OPTIONS (모바일 전용 섹션 추가) */}
              <div className="mb-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500 mb-3 opacity-70">Preferences</p>
                <div className="flex flex-col gap-2">
                  {/* Sort Options */}
                  <div className="bg-slate-900/50 rounded-xl p-1 border border-white/5 flex flex-col gap-1">
                     {SORT_OPTIONS.map((opt) => (
                       <button
                         key={opt.value}
                         onClick={() => onSortChange?.(opt.value)}
                         className={`flex items-center justify-between px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all
                           ${sortBy === opt.value
                             ? "bg-cyan-500/20 text-cyan-300"
                             : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
                           }`}
                       >
                         <span>{opt.label}</span>
                         {sortBy === opt.value && <Check size={12} />}
                       </button>
                     ))}
                  </div>
                </div>
              </div>

              {/* 2. CATEGORIES */}
              <div className="mb-8">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500 mb-3 opacity-70">Categories</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => onCategorySelect(cat)}
                      className={`
                        px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all flex-grow text-center
                        ${activeCategory === cat
                          ? "bg-cyan-500 text-black border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                          : "bg-white/5 text-slate-400 border-white/5 hover:border-cyan-500/30 hover:text-cyan-300"}
                      `}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. BRANDS */}
              <div className="border-t border-white/10 pt-6">
                <div className="flex items-center justify-between mb-4">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500 opacity-70">Brands</p>
                   <span className="text-[9px] text-slate-500">{brands.length} selected</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {BRAND_OPTIONS.map(brand => {
                    const active = brands.includes(brand);
                    return (
                      <button
                        key={brand}
                        onClick={() => toggleBrand(brand)}
                        className={`px-3 py-2.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition-all
                          ${active
                            ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/50"
                            : "bg-slate-900 text-slate-500 border-slate-800"}
                        `}
                      >
                        {brand}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
