
// next-gen-ecommerce/src/pages/Home.tsx
"use client";

import Header from "@/components/layout/Header";
import ProductList from "@/components/product/ProductList";
import { AnimatePresence, motion } from "framer-motion";
import { Cpu, Target, Zap } from "lucide-react";
import { useSearchParams } from "react-router-dom";

interface HomeProps {
  searchQuery?: string;
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

  // LandingView is extracted to a module-level component (declared at the end) to avoid creating components inside render


function LandingView({ handleCategoryChange, viewMode }: { handleCategoryChange: (cat: string) => void; viewMode: "grid" | "list" }) {
  return (
    <div className="space-y-24 md:space-y-32 pb-20 overflow-hidden relative">

      <section className="relative pt-22 md:pt-24 lg:pt-32 px-4 md:px-6 flex flex-col items-center text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 md:gap-3 px-4 py-1.5 rounded-full border border-cyan-500/40 bg-cyan-950/30 backdrop-blur-md mb-6 md:mb-10 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
        >
          <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          <span className="text-[9px] md:text-[11px] font-black tracking-[0.3em] text-cyan-300 uppercase">
            Neural Engine V2.5 Active
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center justify-center font-black tracking-tighter italic text-white mb-6 md:mb-10 leading-[0.85] select-none"
        >
          <span className="text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] xl:text-[11rem] drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            FUTURE
          </span>
          <span className="relative inline-block pr-[0.2em] sm:pr-[0.25em] lg:pr-[0.3em] pl-2 py-4 text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] xl:text-[11rem] font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-cyan-200 to-blue-500 leading-[0.85] z-50 drop-shadow-[0_0_30px_rgba(6,182,212,0.4)] overflow-visible">
            INTERFACE
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-[90%] md:max-w-2xl lg:max-w-3xl text-slate-400 text-xs sm:text-sm md:text-lg lg:text-xl leading-relaxed tracking-wide mb-10 md:mb-16 font-light"
        >
          AI-powered neural network algorithms analyze your usage patterns to suggest the optimal device.
          <br className="hidden md:block"/>
          Experience the new standard of zero-latency, hyper-responsive commerce.
        </motion.p>

        <motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  onClick={() => handleCategoryChange("ALL")}
  className="
    group relative inline-flex items-center justify-center
    overflow-hidden rounded-full p-[1px]
    focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:ring-offset-2 focus:ring-offset-slate-950
    /* 반응형 너비 설정: 모바일에서는 조금 넓게, PC에서는 내용에 맞게 */
    w-auto min-w-[200px] md:min-w-[240px]
  "
>
  {/* 1. 배경 애니메이션 그라디언트 (보더 역할) */}
  {/* 색상 변경: Cyan-400 (밝은 하늘) <-> Blue-600 (진한 파랑) */}
  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-600 to-cyan-400 animate-[shimmer_2s_linear_infinite] bg-[length:200%_100%]" />

  {/* 2. 내부 컨텐츠 영역 */}
  <div className="
    relative w-full h-full
    bg-slate-950 group-hover:bg-slate-900/90 transition-colors duration-300
    rounded-full
    /* 반응형 패딩 및 폰트 크기 조절 */
    px-8 py-4 md:px-10 md:py-5
    flex items-center justify-center gap-3 md:gap-4
  ">

    {/* 장식용 아이콘 (선택사항) */}
    <Zap
      size={16}
      className="text-cyan-500 group-hover:text-cyan-300 transition-colors duration-300 hidden sm:block"
    />

    {/* 텍스트 */}
    <span className="
      font-black uppercase tracking-[0.2em] text-white
      /* 모바일: 12px, 태블릿 이상: 14px */
      text-xs md:text-sm
      group-hover:text-cyan-50 transition-colors
    ">
      Explore Archive
    </span>


  </div>

  {/* 3. 호버 시 나타나는 은은한 광선 효과 (Glow) */}
  <div className="absolute inset-0 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.0)] group-hover:shadow-[0_0_25px_rgba(34,211,238,0.4)] transition-shadow duration-300 pointer-events-none" />

</motion.button>
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30 selection:text-cyan-100">

      <Header
        activeCategory={activeCategory}
        onCategorySelect={handleCategoryChange}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        sortBy={(sortBy === "price_low" || sortBy === "price_high") ? sortBy : "newest"}
        onSortChange={handleSortChange}
        brands={activeBrands}
        onBrandsChange={handleBrandsChange}
      />

      <main className="pt-20">
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
