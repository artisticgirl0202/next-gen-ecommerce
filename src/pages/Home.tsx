
// next-gen-ecommerce/src/pages/Home.tsx
"use client";

import CategoryHeader from "@/components/layout/Header";
import ProductList from "@/components/product/ProductList";
import { AnimatePresence, motion } from "framer-motion";
import { Cpu, Target, Zap } from "lucide-react";
import { useSearchParams } from "react-router-dom";

interface HomeProps {
  searchQuery?: string;
}

// LandingView is defined at module scope (outside Home) to avoid
// creating a new component reference on every render.
function LandingView({ handleCategoryChange, viewMode }: { handleCategoryChange: (cat: string) => void; viewMode: "grid" | "list" }) {
  return (
    <div className="space-y-24 md:space-y-32 pb-20 overflow-hidden relative">

     <section className="relative w-full min-h-[90vh] pt-20 flex flex-col items-center justify-start text-center z-10 overflow-hidden perspective-[1000px]">

      {/* 0. [NEW] 배경: 사이버 그리드 & 스포트라이트 */}
      <div className="absolute inset-0 z-0 pointer-events-none">
       {/* 격자 무늬 배경 */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] 
          [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_10%,transparent_100%)]"
        />
        {/* 중앙 글로우 - 그라데이션으로 자연스럽게 퍼지도록 수정 */}
        <div
          className="
            absolute top-0 left-1/2 -translate-x-1/2
            w-[800px] h-[500px]
            bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.15)_0%,transparent_70%)]
            blur-[60px]
            mix-blend-screen
            pointer-events-none /* 클릭 방지 추가 권장 */
          "
        />
      </div>

      {/* 0. [NEW] HUD 장식 요소 (좌우측 기술적인 라인들) */}
      <div className="absolute top-1/4 left-10 hidden lg:flex flex-col gap-2 opacity-30 select-none pointer-events-none">
        <div className="w-1 h-12 bg-cyan-500/50" />
        <div className="w-1 h-4 bg-cyan-500/30" />
        <span className="text-[10px] font-mono text-cyan-500 rotate-90 origin-left translate-y-8 mt-4">SYS.READY</span>
      </div>
      <div className="absolute top-1/4 right-10 hidden lg:flex flex-col items-end gap-2 opacity-30 select-none pointer-events-none">
        <div className="w-1 h-12 bg-white/20" />
        <div className="w-1 h-4 bg-white/10" />
        <span className="text-[10px] font-mono text-slate-500 -rotate-90 origin-right translate-y-8 mt-4">V.2.0.45</span>
      </div>


      {/* 1. 주인공 이미지 (home-bg.png) + [NEW] Floating Animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: [0, -15, 0] // 둥둥 떠다니는 효과
        }}
        transition={{
          duration: 1, // 등장 속도
          y: { duration: 4, repeat: Infinity, ease: "easeInOut" } // 떠다니는 속도
        }}
        className="
          relative z-10
          flex justify-center items-center
          mb-0
        "
      >
        <img
          src="/home-bg.png"
          alt="Cyber AI hero"
          className="
            relative
            object-contain
            w-[280px] sm:w-[400px] md:w-[500px] lg:w-[700px]
            opacity-90 drop-shadow-[0_0_50px_rgba(6,182,212,0.2)]
            [mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)]
          "
        />
      </motion.div>

      {/* 2. Neural Engine 배지 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="
          relative z-20
          -mt-16 md:-mt-24 lg:-mt-32 
          mb-6 md:mb-8
          group
          cursor-default
        "
      >
        <div className="
          inline-flex items-center gap-2 px-4 py-1.5 md:px-5 md:py-2
          rounded-full border border-cyan-500/20 bg-slate-950/40 backdrop-blur-md 
          shadow-[0_0_20px_rgba(6,182,212,0.1)]
          hover:border-cyan-500/50 hover:shadow-[0_0_25px_rgba(6,182,212,0.3)]
          transition-all duration-300
        ">
          <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_cyan]" />
          <span className="text-[10px] md:text-xs font-bold tracking-[0.2em] text-cyan-200 uppercase group-hover:text-cyan-100 transition-colors">
            Neural Engine V2.5
          </span>
        </div>
      </motion.div>


         {/* 4. 메인 타이틀 (FUTURE INTERFACE) */}

      <motion.h1

        initial={{ opacity: 0, y: 30 }}

        animate={{ opacity: 1, y: 0 }}

        transition={{ delay: 0.2 }}

        className="

          relative z-20

          flex flex-col items-center justify-center

          font-black tracking-tighter italic text-white

          leading-[0.85] select-none

        "

      >

        <span className="text-5xl sm:text-7xl md:text-8xl lg:text-[9rem] xl:text-[11rem] drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">

          FUTURE

        </span>

        <span className="

          text-5xl sm:text-7xl md:text-8xl lg:text-[9rem] xl:text-[11rem]

          text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-blue-500

          drop-shadow-[0_0_30px_rgba(6,182,212,0.6)] pr-10

        ">

          INTERFACE

        </span>

      </motion.h1>
      {/* 4. 설명 텍스트 & 버튼 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="relative z-20 mt-10 md:mt-16 flex flex-col items-center w-full"
      >
        <p className="max-w-[80%] md:max-w-2xl text-slate-400 text-sm md:text-lg mb-10 font-light tracking-wide leading-relaxed">
          <span className="text-cyan-400/80 font-mono text-xs block mb-2 tracking-widest uppercase">
            // System Optimized
          </span>
          AI-powered neural network algorithms suggest the optimal device.
          <br className="hidden md:block" />
          Experience the <span className="text-white font-medium">zero-latency</span> commerce standard.
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleCategoryChange("ALL")}
          className="
            group relative inline-flex items-center justify-center
            overflow-hidden rounded-full p-[1px]
            w-auto min-w-[200px] md:min-w-[240px]
          "
        >
          {/* 회전하는 테두리 효과 */}
          <div className="absolute inset-0 bg-[conic-gradient(from_90deg_at_50%_50%,#00000000_50%,#06b6d4_100%)] animate-[spin_3s_linear_infinite]" />

          <div className="
            relative w-full h-full
             hover:bg-slate-900 transition-colors duration-300
            rounded-full
            px-8 py-4 md:px-10 md:py-5
            flex items-center justify-center gap-3 md:gap-4
            backdrop-blur-xl
          ">
            <Zap
              size={18}
              className="text-cyan-500 group-hover:text-cyan-300 group-hover:scale-110 transition-all duration-300 hidden sm:block drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"
            />
            <span className="
              font-bold uppercase tracking-[0.25em] text-white
              text-xs md:text-sm
              group-hover:text-cyan-50 transition-colors
            ">
              Enter Archive
            </span>
          </div>
        </motion.button>
      </motion.div>

    </section>

      {/* ✅ CORE TECH SECTION : VIEW MODE 적용
        - Grid Mode: 기존 3열 카드 유지
        - List Mode: 1열 가로 배치 (아이콘 좌측, 텍스트 우측)
      */}
      <section className="px-4 md:px-6 max-w-7xl mx-auto">
        <div className={
          viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
            : "flex flex-col gap-4"
        }>
          {[
            { icon: <Cpu />, title: "Neural Link", desc: "Analyzes user search patterns and workflow to curate hardware in 0.1s." },
            { icon: <Zap />, title: "Quantum Speed", desc: "Instant sector switching built on a zero-latency optimized interface." },
            { icon: <Target />, title: "Precision Match", desc: "Device matching algorithm operating with 100% accuracy for your needs." },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className={`
                bg-slate-900/60 border border-white/5 backdrop-blur-md relative overflow-hidden group
                hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-all duration-500 cursor-default
                ${viewMode === "grid"
                    ? "p-8 md:p-10 rounded-[2rem] flex flex-col" // Grid 스타일
                    : "p-6 rounded-2xl flex items-center gap-6" // List 스타일
                }
              `}
            >
              {/* Icon Area */}
              <div className={`
                text-cyan-500 transition-all duration-500 origin-left drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]
                ${viewMode === "grid"
                   ? "mb-6 md:mb-8 scale-110 md:scale-125 group-hover:scale-150 group-hover:text-cyan-300"
                   : "shrink-0 scale-125 p-2 bg-white/5 rounded-full group-hover:text-cyan-300 group-hover:bg-cyan-500/10"
                }
              `}>
                {item.icon}
              </div>

              {/* Text Area */}
              <div className={viewMode === "list" ? "flex-1 z-10" : ""}>
                <h3 className={`
                    text-white font-black tracking-widest uppercase transition-colors group-hover:text-cyan-400
                    ${viewMode === "grid" ? "text-lg md:text-xl mb-3 md:mb-4" : "text-base md:text-lg mb-1"}
                `}>
                  {item.title}
                </h3>
                <p className={`
                    text-slate-400 font-light leading-relaxed transition-colors group-hover:text-slate-200
                    ${viewMode === "grid" ? "text-xs md:text-sm" : "text-xs md:text-sm max-w-2xl"}
                `}>
                  {item.desc}
                </p>
              </div>

              {/* Decorative Number */}
              <div className={`
                absolute text-white/5 font-black italic select-none group-hover:text-cyan-500/10 transition-colors duration-500
                ${viewMode === "grid"
                   ? "-right-4 -bottom-6 text-7xl md:text-8xl"
                   : "right-4 -bottom-4 text-6xl md:text-7xl opacity-50"
                }
              `}>
                0{i + 1}
              </div>

              <div className={`absolute inset-0 border border-cyan-500/0 transition-all duration-500 pointer-events-none group-hover:border-cyan-500/30
                 ${viewMode === "grid" ? "rounded-[2rem]" : "rounded-2xl"}
              `} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURED PREVIEW SECTION */}
      <section className="px-4 md:px-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-end mb-8 md:mb-12 gap-6 ">
         <div className="relative overflow-visible p-10 -ml-10 isolation-isolate z-10">
  <div className="flex items-center gap-2 mb-2 md:mb-3 relative z-20">
    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.95)]" />
    <h2 className="text-slate-500 text-[9px] md:text-[10px] font-black tracking-[0.4em] uppercase">
      Neural / Featured
    </h2>
  </div>

  <p
    className="
      font-display relative z-20
      w-full max-w-[14ch] text-wrap break-words
      text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl
      font-black italic text-white tracking-tighter uppercase leading-[0.95]
      will-change-transform
    "
    style={{
      /*
        Multi-layered text-shadow for a soft neon glow that affects ONLY the glyphs.
        Adjust opacities / offsets to taste; these will not create a gradient on the body.
      */
      textShadow: `
        0 2px 0 rgba(0,0,0,0.45),              /* subtle base shadow for depth */
        0 8px 20px rgba(6,182,212,0.30),       /* wide cyan halo */
        0 4px 8px rgba(6,182,212,0.24),        /* mid halo */
        0 1px 2px rgba(255,255,255,0.02)       /* tiny highlight */
      `
    }}
  >
    AI Recommended Core Units
  </p>
</div>

          <button
            onClick={() => handleCategoryChange("ALL")}
            className="group flex items-center gap-3 md:gap-4 outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 rounded-full py-2 px-1"
          >
            <span className="text-[10px] sm:text-xs md:text-sm font-black tracking-[0.2em] md:tracking-[0.3em] uppercase text-slate-400 group-hover:text-cyan-300 transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(103,232,249,0.8)]">
              View Full Archive
            </span>
            <div className="h-[1px] md:h-[2px] bg-cyan-500/30 w-8 md:w-12 group-hover:w-12 md:group-hover:w-20 group-hover:bg-cyan-400 group-hover:shadow-[0_0_15px_rgba(34,211,238,1)] transition-all duration-500 ease-out rounded-full" />
          </button>
        </div>

        <motion.div
            layout
            className="min-h-[600px] w-full relative"
        >
           {/* ✅ ProductList에도 viewMode 상태 전달 */}
           <ProductList
             category="AI & Next-Gen"
             sortBy="newest"
             viewMode={viewMode} // 기존 "grid" -> viewMode 변수로 변경
             limit={4}
             searchQuery=""
             brands={[]}
           />
        </motion.div>
      </section>
    </div>
  );
}

export default function Home({ searchQuery = "" }: HomeProps) {
  // ✅ [Core Logic] URL 파라미터로 상태 관리
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. URL에서 상태 읽기
  const activeCategory = searchParams.get("category") || "HOME";
  const viewMode = (searchParams.get("view") as "grid" | "list") || "grid";
  const sortBy = searchParams.get("sort") || "newest";
  const brandsParam = searchParams.get("brands");
  const activeBrands = brandsParam ? brandsParam.split(",") : [];

  // 2. 상태 변경 핸들러
  const handleCategoryChange = (cat: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (cat === "HOME") {
        newParams.set("category", "HOME");
    } else {
        newParams.set("category", cat);
    }
    setSearchParams(newParams);
  };

  const handleViewModeChange = (mode: "grid" | "list") => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("view", mode);
    setSearchParams(newParams);
  };

  const handleSortChange = (sort: "newest" | "price_low" | "price_high") => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("sort", sort);
    setSearchParams(newParams);
  };

  const handleBrandsChange = (brands: string[]) => {
    const newParams = new URLSearchParams(searchParams);
    if (brands.length > 0) {
      newParams.set("brands", brands.join(","));
    } else {
      newParams.delete("brands");
    }
    setSearchParams(newParams);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30 selection:text-cyan-100">

      <CategoryHeader
        activeCategory={activeCategory}
        onCategorySelect={handleCategoryChange}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        sortBy={(sortBy === "price_low" || sortBy === "price_high") ? sortBy : "newest"}
        onSortChange={handleSortChange}
        brands={activeBrands}
        onBrandsChange={handleBrandsChange}
      />

      <main className="pt-12">
        <AnimatePresence mode="wait">
          {activeCategory === "HOME" ? (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <LandingView handleCategoryChange={handleCategoryChange} viewMode={viewMode} />
            </motion.div>
          ) : (
            <motion.section
              key="category"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="px-4 md:px-6 pt-6 md:pt-12 pb-20 max-w-7xl mx-auto"
            >
              {/* Sector Title (디자인 유지) */}
              <div className="mt-8 md:mt-12 mb-8 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-l-[4px] border-cyan-500 pl-6 md:pl-8 py-4 relative group">
                <div className="absolute left-[-2px] top-0 bottom-0 w-[4px] bg-cyan-400 blur-[4px] opacity-70" />

                <div className="flex flex-col gap-1 max-w-full">
                  <div className="flex items-center gap-2 mb-1 opacity-80">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(6,182,212,1)]" />
                    <span className="text-cyan-500 font-mono text-[10px] sm:text-xs tracking-[0.2em] uppercase font-bold">
                      SECTOR // {activeCategory === "ALL" ? "TOTAL_ARCHIVE" : activeCategory}
                    </span>
                  </div>

                  <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black italic tracking-tighter uppercase drop-shadow-[0_0_15px_rgba(6,182,212,0.2)] pr-6 pb-1 leading-tight">
                    <span className="inline-block pr-2 lg:pr-5 py-1 bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-400 to-cyan-500">
                      {activeCategory}
                    </span>
                  </h2>

                  <div className="mt-2 flex">
                    <span className="flex items-center gap-2 px-3 py-1 bg-cyan-950/40 border border-cyan-500/30 rounded text-cyan-400 font-mono text-[10px] sm:text-xs tracking-wider backdrop-blur-md shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                      </span>
                      SYSTEM_STATUS: ACTIVE
                    </span>
                  </div>
                </div>

                <div className="w-fit md:w-auto self-end md:self-auto">
                  <div className="flex flex-nowrap items-center gap-x-3 md:gap-x-8 bg-slate-900/80 border border-cyan-500/30 md:border-white/10 px-3 py-2 md:px-6 md:py-3 rounded md:rounded-xl backdrop-blur-md shadow-lg justify-start">
                    <div className="flex flex-col items-center text-center gap-0.5 group cursor-default">
                      <span className="text-[8px] sm:text-[10px] text-slate-500 font-mono uppercase tracking-widest group-hover:text-cyan-400 transition-colors whitespace-nowrap">
                        Algorithm
                      </span>
                      <span className="text-[10px] sm:text-sm text-white font-bold uppercase tracking-tight flex items-center justify-center gap-1.5 whitespace-nowrap">
                        <div className="w-1 h-1 bg-cyan-500 rounded-full shrink-0 shadow-[0_0_5px_rgba(6,182,212,0.8)]" />
                        {sortBy.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="w-[1px] h-5 md:h-6 bg-white/10 shrink-0" />

                    <div className="flex flex-col items-start text-center gap-0.5 group cursor-default">
                      <span className="text-[8px] sm:text-[10px] text-slate-500 font-mono uppercase tracking-widest group-hover:text-cyan-400 transition-colors whitespace-nowrap">
                        Interface
                      </span>
                      <span className="text-[10px] sm:text-sm text-white font-bold uppercase tracking-tight flex items-center justify-center gap-1.5 whitespace-nowrap">
                        <div className="w-1 h-1 bg-cyan-500 rounded-full shrink-0 shadow-[0_0_5px_rgba(6,182,212,0.8)]" />
                        {viewMode}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="min-h-[80vh] w-full">
                <ProductList
                  category={activeCategory}
                  searchQuery={searchQuery}
                  sortBy={sortBy}
                  viewMode={viewMode}
                  brands={activeBrands}
                />
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
