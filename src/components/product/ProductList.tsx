
// // src/components/product/ProductList.tsx
// "use client";

// import { CATEGORY_PRODUCTS } from "@/data/categoryData";
// import type { Product } from "@/types";
// import { AnimatePresence, motion } from "framer-motion";
// import { useEffect, useMemo, useRef, useState } from "react";
// import { BentoCard } from "../ui/BentoCard";
// import ProductDetailModal from "./ProductDetailModal";

// interface ProductListProps {
//   category: string;
//   searchQuery: string;
//   sortBy: string;
//   viewMode: "grid" | "list";
//   limit?: number;

//   // API-related optional props (추가)
//   apiBase?: string; // ex: "/api/products"
//   pageSize?: number; // 서버로 요청할 페이지 사이즈 (기본 24)
//   initialProducts?: Product[]; // 페일백 / SSR로 받은 초기 제품
//   initialTotal?: number; // 초기 total (optional)
//   enableFetch?: boolean; // true이면 API 모드로 동작 (또는 apiBase가 있으면 자동으로 사용)
// }

// type FetchResponse = {
//   items: Product[];
//   total: number;
//   page: number;
//   pageSize: number;
// };

// async function fetchProducts(
//   apiBase: string,
//   {
//     page = 1,
//     pageSize = 24,
//     category,
//     q,
//     sort,
//   }: { page?: number; pageSize?: number; category?: string; q?: string; sort?: string } = {}
// ): Promise<FetchResponse> {
//   const params = new URLSearchParams();
//   params.set("page", String(page));
//   params.set("pageSize", String(pageSize));
//   if (category) params.set("category", category);
//   if (q) params.set("q", q);
//   if (sort) params.set("sort", sort);

//   const url = `${apiBase}?${params.toString()}`;
//   const res = await fetch(url, { cache: "no-store" });
//   if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);
//   const data = (await res.json()) as FetchResponse;
//   return data;
// }

// export default function ProductList({
//   category,
//   searchQuery,
//   sortBy,
//   viewMode,
//   limit,

//   // API props (optional)
//   apiBase = "/api/products",
//   pageSize = 24,
//   initialProducts = [],
//   initialTotal = 0,
//   enableFetch = false,
// }: ProductListProps) {
//   // modal selected
//   const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

//   // ---------------------------------------------------------------------
//   // Global event listener (기존 코드 유지) — 외부에서 모달 열기 가능
//   // ---------------------------------------------------------------------
//   useEffect(() => {
//     function handler(e: any) {
//       if (e?.detail) {
//         setSelectedProduct(e.detail);
//       }
//     }
//     window.addEventListener("open-product", handler);
//     return () => window.removeEventListener("open-product", handler);
//   }, []);

//   // ---------------------------------------------------------------------
//   // API state (only used when api mode enabled)
//   // ---------------------------------------------------------------------
// const useApi = Boolean(enableFetch); // enableFetch=true 일 때만 API 모드
//   const [productsApi, setProductsApi] = useState<Product[]>(initialProducts);
//   const [page, setPage] = useState<number>(1);
//   const [total, setTotal] = useState<number>(initialTotal || 0);
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   const loadMoreRef = useRef<HTMLDivElement | null>(null);

//   // initial load from API if in API mode and no initialProducts provided
//   useEffect(() => {
//     let mounted = true;
//     async function loadInitial() {
//       if (!useApi) return;
//       // if initialProducts were passed, use them (but still allow refetch on param changes)
//       setIsLoading(true);
//       try {
//         const res = await fetchProducts(apiBase || "/api/products", {
//           page: 1,
//           pageSize,
//           category: category && category.toLowerCase() !== "all" ? category : undefined,
//           q: searchQuery || undefined,
//           sort: sortBy || undefined,
//         });
//         if (!mounted) return;
//         setProductsApi(res.items);
//         setTotal(res.total);
//         setPage(res.page);
//         setError(null);
//       } catch (err: any) {
//         if (!mounted) return;
//         setError(err.message || "Failed to load products");
//       } finally {
//         if (mounted) setIsLoading(false);
//       }
//     }

//     // if user provided initialProducts and initialTotal, we still may want to fetch when filters change.
//     // We'll fetch if there are no initial products OR if filtering params changed (category/search/sort)
//     loadInitial();
//     return () => {
//       mounted = false;
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [apiBase, pageSize, category, searchQuery, sortBy, enableFetch]);



// // 변경: fetchProducts 에서 non-json 응답일 경우 응답 텍스트도 포함
// async function fetchProducts(
//   apiBase: string,
//   {
//     page = 1,
//     pageSize = 24,
//     category,
//     q,
//     sort,
//   }: { page?: number; pageSize?: number; category?: string; q?: string; sort?: string } = {}
// ): Promise<FetchResponse> {
//   const params = new URLSearchParams();
//   params.set("page", String(page));
//   params.set("pageSize", String(pageSize));
//   if (category) params.set("category", category);
//   if (q) params.set("q", q);
//   if (sort) params.set("sort", sort);

//   const url = `${apiBase}?${params.toString()}`;

//   // debug helper: 로그로 실제 호출 URL과 응답 헤더 확인
//   console.debug("[fetchProducts] url=", url);

//   const res = await fetch(url, { cache: "no-store" });
//   if (!res.ok) {
//     const text = await res.text().catch(() => "<no body>");
//     throw new Error(`Failed to fetch products: ${res.status} ${text}`);
//   }
//   const data = (await res.json()) as FetchResponse;
//   return data;
// }

//   // IntersectionObserver for infinite scroll (API mode)
//   useEffect(() => {
//     if (!useApi) return;
//     if (!loadMoreRef.current) return;
//     const el = loadMoreRef.current;
//     const io = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           if (entry.isIntersecting) {
//             fetchNext();
//           }
//         });
//       },
//       { root: null, rootMargin: "200px", threshold: 0.1 }
//     );
//     io.observe(el);
//     return () => io.disconnect();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [productsApi, total, page, isFetchingMore, useApi]);

//   // ---------------------------------------------------------------------
//   // Non-API (local) processing: 기존 CATEGORY_PRODUCTS 기반
//   // ---------------------------------------------------------------------
//   const processedLocal = useMemo(() => {
//     let list = [...CATEGORY_PRODUCTS];
//     if (category !== "ALL" && category !== "HOME" && category !== "전체" && category !== "All") {
//       list = list.filter((p) => p.category === category);
//     }
//     if (searchQuery) {
//       list = list.filter(
//         (p) =>
//           p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           (p.brand || "").toLowerCase().includes(searchQuery.toLowerCase())
//       );
//     }
//     list.sort((a, b) => {
//       if (sortBy === "price_low") return a.price - b.price;
//       if (sortBy === "price_high") return b.price - a.price;
//       return (b.id || 0) - (a.id || 0);
//     });
//     return limit ? list.slice(0, limit) : list;
//   }, [category, searchQuery, sortBy, limit]);

//   // ---------------------------------------------------------------------
//   // Final displayed products: API mode -> productsApi (may already be server-filtered)
//   // otherwise -> processedLocal
//   // additionally apply limit prop client-side for API mode as well
//   // ---------------------------------------------------------------------
//   const displayedProducts = useMemo(() => {
//     if (useApi) {
//       if (limit) return productsApi.slice(0, limit);
//       return productsApi;
//     }
//     return processedLocal;
//   }, [useApi, productsApi, processedLocal, limit]);

//   // ---------------------------------------------------------------------
//   // Render
//   // ---------------------------------------------------------------------
//   return (
//     <>
//       {/* Error banner (shared) */}
//       {error && (
//         <div className="p-3 bg-red-50 text-red-700 rounded mx-4">{`오류: ${error}`}</div>
//       )}

//       <motion.div
//         layout
//         className={`
//           ${viewMode === "grid"
//             ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
//             : "flex flex-col gap-6"} px-4
//         `}
//       >
//         <AnimatePresence mode="popLayout">
//           {displayedProducts.map((product) => {
//             const isSvg = typeof product.image === "string" && product.image.toLowerCase().endsWith(".svg");

//             return (
//               <motion.div
//                 key={product.id}
//                 layout
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, scale: 0.95 }}
//                 transition={{ duration: 0.4 }}
//                 whileHover={{ y: -5 }}
//                 className="cursor-default"
//               >
//                 <BentoCard
//                   className={`
//     group relative bg-slate-900/40 border border-white/5 rounded-[2.5rem]
//     transition-all duration-500 hover:border-cyan-500/50 hover:bg-slate-900/60
//     hover:shadow-[0_0_40px_rgba(6,182,212,0.15)]
//     flex flex-col w-full min-h-[360px] sm:min-h-[380px] md:min-h-[400px]
//   `}
//                 >
//                   {/* [1. 이미지 영역] */}
//                   <div
//                     className={`relative w-full overflow-hidden
//     ${isSvg ? "min-h-[180px] sm:min-h-[220px] md:min-h-[280px]" : "aspect-[4/3] md:aspect-[16/9]"}
//   `}
//                   >
//                     <img
//                       src={product.image}
//                       alt={product.name}
//                       className={`w-full h-full transition-transform duration-700 group-hover:scale-105
//         ${isSvg ? "object-contain p-3" : "object-cover"}
//       `}
//                     />
//                     <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60 pointer-events-none" />
//                     <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent h-[200%] -translate-y-full group-hover:animate-scan-line pointer-events-none" />
//                   </div>

//                   {/* [2. 정보 영역 - 이미지 바로 아래] */}
//                   <div className="px-4 py-4 sm:px-5 sm:py-5 md:px-6 md:py-6 flex flex-col gap-3 flex-1 min-h-0">
//                     {/* 브랜드 + 카테고리 */}
//                     <div className="flex justify-between items-start">
//                       <span className="text-cyan-400 text-[9px] sm:text-[10px] font-black tracking-[0.15em] sm:tracking-[0.3em] uppercase drop-shadow-[0_0_8px_rgba(6,182,212,0.5)] pt-1">
//                         {product.brand}
//                       </span>
//                       <div className="flex flex-col p-2 sm:p-3 bg-white/[0.03] border border-white/5 rounded-2xl min-w-[90px] sm:min-w-[110px] group-hover:border-cyan-500/20 group-hover:bg-cyan-500/[0.02] transition-all duration-500">
//                         <span className="text-[7px] sm:text-[8px] text-white font-bold uppercase tracking-widest leading-tight">
//                           {product.category}
//                         </span>
//                         <span className="text-[6px] sm:text-[7px] text-slate-500 font-bold uppercase tracking-widest leading-tight mt-0.5">
//                           SPECIAL PURPOSE
//                         </span>
//                       </div>
//                     </div>

//                     {/* 상품 이름 */}
//                     <h3 className="font-bold text-white tracking-tighter italic uppercase transition-colors group-hover:text-cyan-50
//       text-base sm:text-lg md:text-2xl lg:text-3xl line-clamp-2">
//                       {product.name}
//                     </h3>

//                     {/* 상품 설명 (예: desc) */}
//                     {product.description && (
//                       <p className="text-[10px] sm:text-[11px] md:text-[12px] text-slate-300 line-clamp-3">
//                         {product.description}
//                       </p>
//                     )}

//                     {/* 스펙 그리드 (간단한 placeholder; 실제 specs를 넣어 쓰고 싶으면 아래를 변형) */}
//                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
//                       {[
//                         { label: "Latency", value: "0.1ms", icon: "⚡" },
//                         { label: "Uplink", value: "Neural_G5", icon: "📡" },
//                         { label: "Integrity", value: "99.9%", icon: "💎" },
//                         { label: "Auth", value: "Verified", icon: "🛡️" },
//                       ].map((spec, i) => (
//                         <div
//                           key={i}
//                           className="flex flex-col p-2 sm:p-3 bg-white/[0.03] border border-white/5 rounded-2xl group-hover:border-cyan-500/20 group-hover:bg-cyan-500/[0.02] transition-all duration-500"
//                         >
//                           <div className="flex justify-between items-center mb-1">
//                             <span className="text-[7px] sm:text-[8px] text-slate-500 font-black uppercase tracking-tighter">{spec.label}</span>
//                             <span className="text-[9px] sm:text-[10px] filter grayscale group-hover:grayscale-0 transition-all">{spec.icon}</span>
//                           </div>
//                           <span className="text-[9px] sm:text-[10px] text-cyan-400 font-mono font-black tracking-tight">{spec.value}</span>
//                         </div>
//                       ))}
//                     </div>

//                     {/* 가격 + 버튼 */}
//                     <div className="flex flex-col gap-3 pt-3 border-t border-white/5 mt-auto">
//                       {/* 가격 */}
//                       <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white leading-none tracking-tighter">
//                         ${product.price?.toLocaleString?.() ?? product.price}
//                       </span>

//                       {/* 버튼 */}
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           setSelectedProduct(product as any);
//                         }}
//                         className="relative overflow-hidden w-full px-3 py-2 sm:px-4 sm:py-2.5 md:px-5 md:py-3 rounded-xl text-[9px] sm:text-[10px] md:text-[12px] font-black tracking-[0.18em] uppercase
//           transition-all duration-250 bg-white/10 text-slate-200 border border-white/10
//           hover:bg-cyan-500 hover:text-black hover:border-cyan-400
//           hover:shadow-[0_0_26px_rgba(6,182,212,0.45)] hover:scale-[1.02] active:scale-[0.98]
//           flex items-center justify-center cursor-pointer z-20"
//                       >
//                         <span className="relative z-10 flex items-center gap-2">
//                           Access_Data <span className="opacity-50">→</span>
//                         </span>
//                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
//                       </button>
//                     </div>
//                   </div>

//                   {/* 카드 배경 노이즈 */}
//                   <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
//                 </BentoCard>
//               </motion.div>
//             );
//           })}
//         </AnimatePresence>
//       </motion.div>

//       {/* API 모드: 로딩 / 더 불러오기 컨트롤 */}
//       {useApi && (
//         <div className="flex items-center justify-center mt-6">
//           {isFetchingMore ? (
//             <div className="p-3">로딩 중...</div>
//           ) : productsApi.length < (total || Infinity) ? (
//             <button
//               onClick={() => fetchNext()}
//               className="px-4 py-2 rounded-2xl bg-cyan-600 text-white font-semibold"
//             >
//               더 불러오기
//             </button>
//           ) : (
//             <div className="p-3 text-sm text-gray-500">모든 제품을 불러왔습니다 ({total})</div>
//           )}
//         </div>
//       )}

//       {/* 로컬 모드: limit/총개수 표시 (optional) */}
//       {!useApi && limit && <div className="text-sm text-gray-500 px-4 mt-4">총 {displayedProducts.length}개 (limit 적용)</div>}

//       {/* invisible sentinel used by IntersectionObserver */}
//       <div ref={loadMoreRef} style={{ height: 1 }} />

//       {selectedProduct && (
//         <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
//       )}
//     </>
//   );
// }
// src/components/product/ProductList.tsx



// "use client";

// import { CATEGORY_PRODUCTS } from "@/data/categoryData";
// import type { Product } from "@/types";
// import { AnimatePresence, motion } from "framer-motion";
// import { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import { BentoCard } from "../ui/BentoCard";
// import ProductDetailModal from "./ProductDetailModal";

// // --- Types ---
// interface ProductListProps {
//   category: string;
//   searchQuery: string;
//   sortBy: string;
//   viewMode: "grid" | "list";
//   limit?: number;
//   apiBase?: string;
//   pageSize?: number;
//   enableFetch?: boolean;
// }

// type FetchResponse = {
//   items: Product[];
//   total: number;
//   page: number;
//   pageSize: number;
// };

// // --- Fetch Utility ---
// async function fetchProducts(
//   apiBase: string,
//   {
//     page = 1,
//     pageSize = 24,
//     category,
//     q,
//     sort,
//   }: { page?: number; pageSize?: number; category?: string; q?: string; sort?: string } = {}
// ): Promise<FetchResponse> {
//   const params = new URLSearchParams();
//   params.set("page", String(page));
//   params.set("page_size", String(pageSize));
//   if (category && category !== "ALL" && category !== "HOME") params.set("category", category);
//   if (q) params.set("q", q);
//   if (sort) params.set("sort", sort);

//   const url = `${apiBase}?${params.toString()}`;

//   try {
//     const res = await fetch(url, { cache: "no-store" });
//     if (!res.ok) {
//       const text = await res.text().catch(() => "No body");
//       throw new Error(`API Error ${res.status}: ${text}`);
//     }
//     return await res.json();
//   } catch (err) {
//     console.error("Fetch failed:", err);
//     throw err;
//   }
// }

// export default function ProductList({
//   category,
//   searchQuery,
//   sortBy,
//   viewMode,
//   limit,
//   apiBase = "/api/products",
//   pageSize = 24,
//   enableFetch = true,
// }: ProductListProps) {
//   // --- State ---
//   const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
//   const [productsApi, setProductsApi] = useState<Product[]>([]);
//   const [page, setPage] = useState<number>(1);
//   const [total, setTotal] = useState<number>(0);
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const loadMoreRef = useRef<HTMLDivElement | null>(null);

//   // --- Logic: Filtering & Fetching ---
//   const localFiltered = useMemo(() => {
//     let list = [...CATEGORY_PRODUCTS];
//     if (category && category !== "ALL" && category !== "HOME" && category !== "전체" && category !== "All") {
//       list = list.filter((p) => p.category === category);
//     }
//     if (searchQuery) {
//       const q = searchQuery.toLowerCase();
//       list = list.filter((p) => p.name.toLowerCase().includes(q) || (p.brand || "").toLowerCase().includes(q));
//     }
//     list.sort((a, b) => {
//       if (sortBy === "price_low") return a.price - b.price;
//       if (sortBy === "price_high") return b.price - a.price;
//       return (b.id || 0) - (a.id || 0);
//     });
//     return list;
//   }, [category, searchQuery, sortBy]);

//   const loadApiData = useCallback(async (targetPage: number, append: boolean = false) => {
//     if (!enableFetch) return;
//     if (isLoading || (append && isFetchingMore)) return;
//     append ? setIsFetchingMore(true) : setIsLoading(true);
//     try {
//       const data = await fetchProducts(apiBase, { page: targetPage, pageSize, category, q: searchQuery, sort: sortBy });
//       setProductsApi((prev) => (append ? [...prev, ...data.items] : data.items));
//       setTotal(data.total);
//       setPage(data.page);
//       setError(null);
//     } catch (err: any) {
//       setError(err.message || "Failed to load remote products");
//     } finally {
//       setIsLoading(false);
//       setIsFetchingMore(false);
//     }
//   }, [apiBase, pageSize, category, searchQuery, sortBy, enableFetch]);

//   useEffect(() => { loadApiData(1, false); }, [loadApiData]);

//   const fetchNext = () => {
//     if (productsApi.length < total && !isFetchingMore) loadApiData(page + 1, true);
//   };

//   useEffect(() => {
//     if (!enableFetch || !loadMoreRef.current) return;
//     const el = loadMoreRef.current;
//     const io = new IntersectionObserver((entries) => { if (entries[0].isIntersecting) fetchNext(); }, { threshold: 0.1, rootMargin: "200px" });
//     io.observe(el);
//     return () => io.disconnect();
//   }, [productsApi, total, isFetchingMore, enableFetch, loadApiData]);

//   const displayedProducts = useMemo(() => {
//     const combined = [...localFiltered, ...productsApi];
//     if (limit) return combined.slice(0, limit);
//     return combined;
//   }, [localFiltered, productsApi, limit]);

//   const isList = viewMode === "list";

//   return (
//     <>
//       {error && (
//         <div className="mx-4 p-4 bg-red-500/10 border border-red-500/50 text-red-500 rounded-xl mb-6 backdrop-blur-sm">
//           <span className="font-bold">SYSTEM ERROR:</span> {error}
//         </div>
//       )}

//       <motion.div
//         layout
//         className={`
//           gap-1 w-full
//           ${isList
//             ? "flex flex-col gap-4"
//             : "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 auto-rows-fr"
//           }
//         `}
//       >
//         <AnimatePresence mode="popLayout">
//           {displayedProducts.map((product, idx) => {
//             const uniqueKey = `${product.id}-${idx}`;
//             const isSvg = typeof product.image === "string" && product.image.toLowerCase().endsWith(".svg");

//             return (
//               <motion.div
//                 key={uniqueKey}
//                 layout
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, scale: 0.95 }}
//                 transition={{ duration: 0.3 }}
//                 className="w-full h-full"
//               >
//                 <BentoCard
//                   className={`
//                     group relative bg-slate-900/40 border border-white/5 rounded-[1.5rem] sm:rounded-[2rem]
//                     transition-all duration-500 hover:border-cyan-500/50 hover:bg-slate-900/60
//                     hover:shadow-[0_0_40px_rgba(6,182,212,0.1)]
//                     w-full h-full flex flex-col

//                     /* --- [PADDING & LAYOUT LOGIC] --- */
//                     ${isList
//                       ? "p-4 md:p-6 md:flex-row md:items-stretch gap-4 md:gap-8" // List View: Equal padding all around (Top/Bottom Mobile, Left/Right Desktop)
//                       : "p-3 sm:p-5 gap-2 sm:gap-3" // Grid View: Standard padding
//                     }
//                   `}
//                 >
//                   {/* --- [1. IMAGE AREA] --- */}
//                   <div className={`
//                     relative overflow-hidden shrink-0 border border-white/5 rounded-xl
//                     ${isList
//                       ? "w-full aspect-video md:w-[240px] md:aspect-auto md:h-auto" // List View: Now inside padding, fully rounded
//                       : "w-full aspect-[4/3]" // Grid View
//                     }
//                   `}>
//                     <img
//                       src={product.image}
//                       alt={product.name}
//                       className={`
//                         w-full h-full transition-transform duration-700 group-hover:scale-105
//                         ${isSvg ? "object-contain p-6 md:p-8" : "object-cover"}
//                       `}
//                     />
//                     <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-40 pointer-events-none" />
//                   </div>

//                   {/* --- [2. CONTENT AREA] --- */}
//                   <div className={`
//                     flex flex-1
//                     ${isList
//                       ? "flex-col md:flex-row md:items-center p-0" // List View: No inner padding needed (parent has it)
//                       : "flex-col pt-1" // Grid View
//                     }
//                   `}>

//                     {/* Info Section */}
//                     <div className={`flex flex-col ${isList ? "flex-1 md:items-start md:justify-center" : "w-full"}`}>

//                       {/* Top Row: Brand (+ Specs on Mobile List) */}
//                       <div className="flex justify-between items-center w-full mb-1 sm:mb-0">
//                         <span className={`text-cyan-400 font-black tracking-[0.2em] uppercase drop-shadow-md ${isList ? "text-xs mb-1" : "text-[10px] sm:text-xs"}`}>
//                           {product.brand || "BRAND"}
//                         </span>

//                         {/* Mobile List View Only: Top Right Specs */}
//                         {isList && (
//                             <div className="flex gap-2 md:hidden">
//                                 <span className="text-[10px] text-slate-500 font-mono">NET:5G+</span>
//                                 <span className="text-[10px] text-slate-500 font-mono">SYNC:AUTO</span>
//                             </div>
//                         )}
//                       </div>

//                       {/* Name */}
//                       <h3 className={`font-bold text-white uppercase italic leading-tight group-hover:text-cyan-50 transition-colors ${isList ? "text-lg md:text-2xl mb-2 line-clamp-1" : "text-base sm:text-xl md:text-2xl mt-1 line-clamp-2"}`}>
//                         {product.name}
//                       </h3>

//                       {/* Description */}
//                       {(product.description || isList) && (
//                         <p className={`text-slate-400 leading-relaxed opacity-80 ${isList ? "text-sm line-clamp-2 md:line-clamp-2 w-full max-w-2xl" : "text-[10px] sm:text-sm line-clamp-2"}`}>
//                           {product.description || "No description available."}
//                         </p>
//                       )}

//                       {/* Desktop List View Category */}
//                       {isList && (
//                          <div className="hidden md:inline-flex mt-3 px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-slate-400 uppercase tracking-widest w-fit">
//                             {product.category || "ETC"}
//                          </div>
//                       )}
//                     </div>

//                     {/* Bottom/Right Section */}
//                     <div className={`flex ${isList ? "flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 md:min-w-[140px] md:border-l md:border-white/5 md:pl-8 mt-2 md:mt-0" : "flex-col gap-2 mt-auto border-t border-white/5 pt-2 sm:pt-3 w-full"}`}>

//                       {/* [Grid View] Specs & Category Row */}
//                       {!isList ? (
//                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 mb-1">
//                             {/* Desktop/Tablet Grid: Show Category here */}
//                             <span className="hidden md:inline-block text-[10px] text-slate-500 font-mono uppercase tracking-wider">
//                               {product.category || "ETC"}
//                             </span>
//                             {/* Divider for Desktop */}
//                             <span className="hidden md:inline-block text-[10px] text-slate-700">|</span>

//                             {/* Specs: Mobile=Small/Tight, Desktop=Normal */}
//                             <span className="text-[9px] sm:text-[10px] text-slate-500 font-mono">NET:5G+</span>
//                             <span className="text-[9px] sm:text-[10px] text-slate-500 font-mono">SYNC:AUTO</span>
//                          </div>
//                       ) : (
//                         // [Desktop List View] Specs
//                         <div className="hidden md:flex gap-3 mb-2">
//                            <span className="text-[10px] text-slate-500 font-mono">NET:5G+</span>
//                            <span className="text-[10px] text-slate-500 font-mono">SYNC:AUTO</span>
//                         </div>
//                       )}

//                       {/* Price */}
//                       <div className={`${isList ? "md:text-right" : "flex items-center justify-between"}`}>
//                          <span className={`font-black text-white tracking-tight ${isList ? "text-xl md:text-2xl" : "text-lg sm:text-2xl"}`}>
//                            ${product.price?.toLocaleString()}
//                          </span>
//                       </div>

//                       {/* Button */}
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           setSelectedProduct(product);
//                         }}
//                         className={`
//                           relative overflow-hidden rounded-lg sm:rounded-xl font-bold uppercase tracking-widest transition-all duration-300
//                           bg-white/5 border border-white/10 text-slate-200
//                           hover:bg-cyan-500 hover:text-black hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]
//                           group/btn flex items-center justify-center
//                           ${isList
//                             ? "px-6 py-2 md:py-3 text-xs md:w-full"
//                             : "w-full py-2 sm:py-3 text-[10px] sm:text-sm"
//                           }
//                         `}
//                       >
//                         <span className="relative z-10 flex items-center gap-2">Access</span>
//                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-shimmer pointer-events-none" />
//                       </button>
//                     </div>

//                   </div>
//                   <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
//                 </BentoCard>
//               </motion.div>
//             );
//           })}
//         </AnimatePresence>
//       </motion.div>

//       {/* --- Loader & Modal --- */}
//        {enableFetch && (
//         <div className="flex flex-col items-center justify-center mt-12 mb-20 gap-4">

//           {(isLoading || isFetchingMore) ? (
//             /* [상태 1] 로딩 중: 텍스트 없이 심플한 네온 스피너만 표시 (디자인 유지) */
//               <div className="flex flex-col items-center gap-2">
//               <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
//               <span className="text-cyan-500 font-mono text-xs animate-pulse tracking-widest">SYNCHRONIZING DATA...</span>
//             </div>
//           ) : (productsApi.length >= total && total > 0) ? (
//             /* [상태 2] 로딩 끝 & 데이터 전부 로드됨: END 문구 표시 */
//             <div className="text-slate-600 text-xs font-mono uppercase tracking-widest opacity-50">
//               // END OF STREAM //
//             </div>
//           ) : (
//              /* [상태 3] 데이터 남음 & 로딩 대기 중: 아무것도 표시 안 함 (자동 로딩) */
//              null
//           )}

//           {/* 무한 스크롤 감지용 투명 트리거 */}
//           <div ref={loadMoreRef} className="h-1 w-full opacity-0 pointer-events-none" />
//         </div>
//       )}
//       {selectedProduct && <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
//     </>
//   );
// }

//ProductList

"use client";

import { MERGED_PRODUCTS } from "@/data/combined_fast";
import type { Product } from "@/types"; // 타입 경로는 환경에 맞게 확인해주세요
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { BentoCard } from "../ui/BentoCard";
import ProductDetailModal from "./ProductDetailModal";

// --- Types ---
interface ProductListProps {
  category: string;
  searchQuery: string;
  sortBy: string;
  viewMode: "grid" | "list";
  limit?: number;
  brands?: string[]; // ✅ [Added] 브랜드 필터 Prop 추가
}

// 🛠️ 헬퍼 함수: 대소문자/띄어쓰기 무시
const normalize = (str: string) => str?.toLowerCase().replace(/\s+/g, "") || "";

export default function ProductList({
  category = "All",
  searchQuery,
  sortBy,
  viewMode,
  limit,
  brands = [], // ✅ [Added] 기본값 설정
}: ProductListProps) {
  // --- State ---
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // 렌더링 성능을 위해 처음에 24개만 보여주고 스크롤 시 더 보여줌
  const [visibleCount, setVisibleCount] = useState<number>(24);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // 카테고리나 필터 변경 시 스크롤 및 개수 초기화
  useEffect(() => {
    setVisibleCount(24);
  }, [category, searchQuery, sortBy, brands]); // ✅ [Added] brands 변경 시에도 초기화

  // --- Logic: Filtering & Sorting ---
  const filteredProducts = useMemo(() => {
    // 1. 전체 데이터 가져오기 (MERGED_PRODUCTS는 이미 [기본데이터, 데모데이터] 순서임)
    let list = [...MERGED_PRODUCTS];

    // 2. Category Filter
    const targetCategory = normalize(category);

    // "All"이 아닐 때만 필터링
    if (targetCategory !== "all") {
      list = list.filter((p) => normalize(p.category) === targetCategory);
    }

    // 3. Search Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        (p.brand || "").toLowerCase().includes(q)
      );
    }

    // 4. ✅ [Added] Brand Filter
    // URL에서 선택된 브랜드들이 있다면, 해당 브랜드의 제품만 남김
    if (brands.length > 0) {
      list = list.filter((p) => p.brand && brands.includes(p.brand));
    }

    // 5. Sorting
    // "All" 카테고리이고 정렬이 기본(newest)일 때는 원본 순서(기본 데이터 상단) 유지
    // 그 외의 정렬 조건일 때만 sort 실행
    if (sortBy === "price_low") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_high") {
      list.sort((a, b) => b.price - a.price);
    }
    // sortBy가 "newest"이거나 없으면 이미 combined_fast.ts에서 정한 순서(기본 -> 데모) 유지

    return list;
  }, [category, searchQuery, sortBy, brands]); // ✅ [Added] 의존성 배열에 brands 추가

  // --- Pagination (Infinite Scroll) ---
  const displayedProducts = useMemo(() => {
    const sliced = filteredProducts.slice(0, visibleCount);
    if (limit) return sliced.slice(0, limit);
    return sliced;
  }, [filteredProducts, visibleCount, limit]);

  const hasMore = visibleCount < filteredProducts.length;

  useEffect(() => {
    if (!hasMore || limit) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleCount((prev) => prev + 24);
      }
    }, { threshold: 0.1, rootMargin: "200px" });

    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, limit]);

  const isList = viewMode === "list";

  return (
    <>
      <motion.div
        layout
        className={`
          gap-1 w-full
          ${isList
            ? "flex flex-col gap-4"
            : "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 auto-rows-fr"
          }
        `}
      >
        <AnimatePresence mode="popLayout">
          {displayedProducts.map((product, idx) => {
            // 키 충돌 방지를 위해 idx 포함
            const uniqueKey = `prod-${product.id}-${idx}`;
            const isSvg = typeof product.image === "string" && product.image.toLowerCase().endsWith(".svg");

            return (
              <motion.div
                key={uniqueKey}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full"
              >
                <BentoCard
                  className={`
                    group relative bg-slate-900/40 border border-white/5 rounded-[1.5rem] sm:rounded-[2rem]
                    transition-all duration-500 hover:border-cyan-500/50 hover:bg-slate-900/60
                    hover:shadow-[0_0_40px_rgba(6,182,212,0.1)]
                    w-full h-full flex flex-col

                    ${isList
                      ? "p-4 md:p-6 md:flex-row md:items-stretch gap-4 md:gap-8"
                      : "p-3 sm:p-5 gap-2 sm:gap-3"
                    }
                  `}
                >
                  {/* --- Image --- */}
                  <div className={`
                    relative overflow-hidden shrink-0 border border-white/5 rounded-xl
                    ${isList
                      ? "w-full aspect-video md:w-[240px] md:aspect-auto md:h-auto"
                      : "w-full aspect-[4/3]"
                    }
                  `}>
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      className={`
                        w-full h-full transition-transform duration-700 group-hover:scale-105
                        ${isSvg ? "object-contain p-6 md:p-8" : "object-cover"}
                      `}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://placehold.co/400x300/1e293b/475569?text=No+Image";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-40 pointer-events-none" />
                  </div>

                  {/* --- Content --- */}
                  <div className={`
                    flex flex-1
                    ${isList
                      ? "flex-col md:flex-row md:items-center p-0"
                      : "flex-col pt-1"
                    }
                  `}>

                    {/* Info */}
                    <div className={`flex flex-col ${isList ? "flex-1 md:items-start md:justify-center" : "w-full"}`}>
                      <div className="flex justify-between items-center w-full mb-1 sm:mb-0">
                        <span className={`text-cyan-400 font-black tracking-[0.2em] uppercase drop-shadow-md ${isList ? "text-xs mb-1" : "text-[10px] sm:text-xs"}`}>
                          {product.brand || "BRAND"}
                        </span>
                      </div>

                      <h3 className={`font-bold text-white uppercase italic leading-tight group-hover:text-cyan-50 transition-colors ${isList ? "text-lg md:text-2xl mb-2 line-clamp-1" : "text-base sm:text-xl md:text-2xl mt-1 line-clamp-2"}`}>
                        {product.name}
                      </h3>

                      {(product.description || isList) && (
                        <p className={`text-slate-400 leading-relaxed opacity-80 ${isList ? "text-sm line-clamp-2 md:line-clamp-2 w-full max-w-2xl" : "text-[10px] sm:text-sm line-clamp-2"}`}>
                          {product.description || "High-performance tech designed for the future."}
                        </p>
                      )}

                      {isList && (
                          <div className="hidden md:inline-flex mt-3 px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-slate-400 uppercase tracking-widest w-fit">
                           {product.category || "ETC"}
                          </div>
                      )}
                    </div>

                    {/* Bottom Info / Action */}
                    <div className={`flex ${isList ? "flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 md:min-w-[140px] md:border-l md:border-white/5 md:pl-8 mt-2 md:mt-0" : "flex-col gap-2 mt-auto border-t border-white/5 pt-2 sm:pt-3 w-full"}`}>

                      {!isList && (
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 mb-1">
                            <span className="hidden md:inline-block text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                              {product.category || "ETC"}
                            </span>
                          </div>
                      )}

                      <div className={`${isList ? "md:text-right" : "flex items-center justify-between"}`}>
                          <span className={`font-black text-white tracking-tight ${isList ? "text-xl md:text-2xl" : "text-lg sm:text-2xl"}`}>
                            ${product.price?.toLocaleString()}
                          </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProduct(product);
                        }}
                        className={`
                          relative overflow-hidden rounded-lg sm:rounded-xl font-bold uppercase tracking-widest transition-all duration-300
                          bg-white/5 border border-white/10 text-slate-200
                          hover:bg-cyan-500 hover:text-black hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]
                          group/btn flex items-center justify-center cursor-pointer
                          ${isList
                            ? "px-6 py-2 md:py-3 text-xs md:w-full"
                            : "w-full py-2 sm:py-3 text-[10px] sm:text-sm"
                          }
                        `}
                      >
                        <span className="relative z-10 flex items-center gap-2">Access</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-shimmer pointer-events-none" />
                      </button>
                    </div>

                  </div>
                  <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
                </BentoCard>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Loader */}
      {!limit && (
        <div className="flex flex-col items-center justify-center mt-12 mb-20 gap-4">
           {hasMore ? (
             <div className="flex flex-col items-center gap-2">
               <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
               <span className="text-cyan-500 font-mono text-xs animate-pulse tracking-widest">LOADING DATA...</span>
             </div>
           ) : (
             <div className="text-slate-600 text-xs font-mono uppercase tracking-widest opacity-50">
               // END OF STREAM //
             </div>
           )}
           <div ref={loadMoreRef} className="h-1 w-full opacity-0 pointer-events-none" />
        </div>
      )}

      {selectedProduct && <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
    </>
  );
}
