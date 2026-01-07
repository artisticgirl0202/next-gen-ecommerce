
// // src/components/ProductDetailModal.tsx
// import { fetchHybridRecommendations } from "@/api/recommend";
// import { useAuth } from "@/store/authStore";
// import { useCart } from "@/store/cartStore";
// import type { Product } from "@/types";
// import { AnimatePresence, motion } from "framer-motion";
// import { CheckCircle, ShoppingCart, X } from "lucide-react";
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";






// type Recommendation = Product & {
//   why?: string;
//   confidence?: number;
// };

// export default function ProductDetailModal({
//   product,
//   onClose,
// }: {
//   product: Product;
//   onClose: () => void;
// }) {
//   const { user, isLoggedIn } = useAuth(); // store에서 로그인 상태 가져오기
//   const addItem = useCart((state) => state.addItem);
//   const currentQty = useCart((state) =>
//     state.items.find((item) => item.id === product.id)?.qty || 0
//   );
//   const [addedFeedback, setAddedFeedback] = useState(false);
//   const [recommendations, setRecommendations] = useState<Recommendation[] | null>(null);
//   const [recsLoading, setRecsLoading] = useState(false);

//   const userId = 1;

//   const navigate = useNavigate()

//   const handleBuyNow = () => {
//   addItem({ ...product, qty: 1 } as any);
//   if (isLoggedIn) {
//     navigate("/checkout");
//   } else {
//     navigate("/checkout-gateway"); // 로그인/비회원 선택창으로
//   }
// };

//   const handleAdd = () => {
//     addItem({
//       id: product.id,
//       name: product.name,
//       price: product.price,
//       image: product.image,
//       qty: 1,
//     } as any);

//     setAddedFeedback(true);
//     setTimeout(() => setAddedFeedback(false), 1000);
//   };

//   useEffect(() => {
//     if (!product) return;
//     try {
//       const url = `${import.meta.env.VITE_API_BASE ?? "http://localhost:8000"}/interact`;
//       const payload = JSON.stringify({
//         user_id: userId,
//         product_id: product.id,
//         event: "view",
//       });
//       if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
//         const blob = new Blob([payload], { type: "application/json" });
//         navigator.sendBeacon(url, blob);
//       } else {
//         fetch(url, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: payload,
//           keepalive: true,
//           credentials: "omit",
//         }).catch(() => {});
//       }
//     } catch (e) {
//       console.warn("postInteraction failed", e);
//     }

//     setRecsLoading(true);
//     fetchHybridRecommendations(product.id, 6)
//       .then((json) => {
//         const recs = Array.isArray(json?.recommendations)
//           ? json.recommendations
//           : Array.isArray(json)
//           ? json
//           : [];
//         setRecommendations(recs);
//       })
//       .catch((err) => {
//         console.warn("fetchHybridRecommendations failed", err);
//         setRecommendations([]);
//       })
//       .finally(() => setRecsLoading(false));
//   }, [product]);

//   const isSvg = typeof product.image === "string" && product.image.toLowerCase().endsWith(".svg");

//   return (
//     // modal root: fixed, centered, allow inner column flex, max height and scroll for content
//     <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
//       {/* overlay */}
//       <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={onClose} />

//       {/* modal card: relative so absolute buttons inside work; max-h to prevent overflow off-screen */}
//       <div className="relative z-10 w-full max-w-6xl max-h-[90vh] bg-slate-950 border border-cyan-500/30 rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col lg:flex-row">
//         {/* CLOSE BUTTON: absolute on small/medium (so it's top-right), on large screens we keep it visually inline */}
//         <button
//           onClick={onClose}
//           aria-label="Close product"
//           className="absolute right-4 top-4 z-50 p-2.5 bg-black/40 backdrop-blur-sm border border-white/10 text-white rounded-full shadow-[0_10px_30px_rgba(2,12,23,0.6)] hover:bg-red-500 transition-all"
//         >
//           <X size={18} />
//         </button>

//         {/* IMAGE SECTION */}
//         <div
//           className={`w-full lg:w-2/5 ${isSvg ? "min-h-[260px] lg:min-h-0" : "h-80 lg:h-auto"} relative bg-slate-900 flex-shrink-0`}
//         >
//           <img
//             src={product.image}
//             alt={product.name}
//             className={`w-full h-full transition-all ${isSvg ? "object-contain p-6" : "object-cover"}`}
//           />
//           <AnimatePresence>
//             {currentQty > 0 && (
//               <motion.div
//                 initial={{ opacity: 0, x: 20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 className="absolute top-6 left-6 bg-cyan-500 text-black px-4 py-2 rounded-full font-black text-xs shadow-[0_0_20px_rgba(6,182,212,0.5)]"
//               >
//                 IN SYSTEM: {currentQty} UNITS
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>

//         {/* INFO SECTION: flex-1 and overflow-y-auto with min-h-0 ensures inner scroll works on mobile */}
//         <div className="flex-1 p-6 md:p-10 overflow-y-auto no-scrollbar relative min-h-0">
//           {/* For mobile/tablet: small SVG-mode button on the right-top of info card (visible below lg) */}
//           <div className="absolute right-4 top-4 md:right-6 md:top-6 lg:hidden z-30">
//             <button
//               onClick={() => {}}
//               title="SVG Mode Action"
//               className="bg-white/5 hover:bg-cyan-500 text-white rounded-full p-2"
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
//                 <path d="M12 2 L12 12"></path>
//                 <path d="M12 12 L16 8"></path>
//               </svg>
//             </button>
//           </div>

//           <div className="flex justify-between items-start mb-4 md:mb-6">
//             <div className="min-w-0">
//               <span className="text-cyan-400 text-xs font-black tracking-widest uppercase px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
//                 {product.brand}
//               </span>
//               <h2 className="text-2xl md:text-4xl font-black text-white mt-4 italic tracking-tighter uppercase">{product.name}</h2>
//               <div className="mt-2 text-sm text-slate-400">{product.categories?.join(" • ")}</div>
//             </div>

//             {/* NOTE: on large screens the close button is static (see button above with lg:static) */}
//           </div>

//           <div className="text-2xl md:text-3xl font-black text-white mb-4">${product.price?.toLocaleString() ?? '—'}</div>

//           {/* description */}
//           <div className="text-slate-300 text-sm leading-relaxed mb-6 whitespace-pre-wrap">
//             {product.description ?? "No description available."}
//           </div>

//           {/* specifications */}
//           <div className="mb-6">
//             <h3 className="text-white font-bold mb-3">Specifications</h3>
//             {product.specs && Object.keys(product.specs || {}).length ? (
//               <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
//                 {Object.entries(product.specs).map(([k, v]) => (
//                   <div key={k} className="p-3 bg-white/[0.03] border border-white/5 rounded-lg">
//                     <div className="text-[10px] text-slate-400 uppercase font-black tracking-wider">{k}</div>
//                     <div className="text-sm text-cyan-200 font-mono font-black mt-1">{v}</div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="text-slate-500">No specs available.</div>
//             )}
//           </div>

//           {/* extra info grid */}
//           <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
//             <div className="p-4 bg-white/[0.03] border border-white/5 rounded-lg">
//               <div className="text-[10px] text-slate-400 uppercase font-black">Warranty</div>
//               <div className="text-sm text-white font-black mt-2">{product?.['warranty'] ?? '1 year limited'}</div>
//             </div>
//             <div className="p-4 bg-white/[0.03] border border-white/5 rounded-lg">
//               <div className="text-[10px] text-slate-400 uppercase font-black">Release</div>
//               <div className="text-sm text-white font-black mt-2">{product?.['release_date'] ?? '2025'}</div>
//             </div>
//             <div className="p-4 bg-white/[0.03] border border-white/5 rounded-lg">
//               <div className="text-[10px] text-slate-400 uppercase font-black">Integration</div>
//               <div className="text-sm text-white font-black mt-2">{product?.['integration'] ?? 'Cloud / Edge'}</div>
//             </div>
//           </div>

//           {/* actions */}
//           <div className="flex flex-col sm:flex-row gap-4 mb-6">
//             <button
//               onClick={handleAdd}
//               disabled={addedFeedback}
//               className={`flex-1 py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all uppercase text-sm ${addedFeedback ? "bg-emerald-500 text-white" : "bg-white text-black hover:bg-cyan-400"}`}
//             >
//               {addedFeedback ? (
//                 <>
//                   <CheckCircle size={18} /> Added
//                 </>
//               ) : (
//                 <>
//                   <ShoppingCart size={18} /> {currentQty > 0 ? `Add Another (${currentQty})` : "Add to Cart"}
//                 </>
//               )}
//             </button>

//             <button
//               onClick={handleBuyNow}
//                className={`
//     flex-1 py-4 rounded-2xl font-black flex items-center justify-center gap-3
//     transition-all uppercase text-sm
//     border border-white/10
//     ${addedFeedback
//       ? "bg-white text-black hover:bg-cyan-400 hover:text-white"
//       : "bg-cyan-600 text-white hover:bg-white hover:text-black"}
//   `}
//             >

//               Buy Now
//             </button>
//           </div>

//           {/* recommendations */}
//           <div className="border-t border-white/10 pt-6">
//             <h3 className="text-white font-bold mb-4">Recommended for you</h3>
//             {recsLoading && <div className="text-slate-400">Loading...</div>}
//             {!recsLoading && recommendations?.length ? (
//               <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
//                 {recommendations.map((r) => (
//                   <div key={r.id} className="w-44 shrink-0 relative group">
//                     {/* small svg button in top-right of each recommendation card */}
//                     <button
//                       aria-label={`Open ${r.name}`}
//                       className="absolute right-2 top-2 z-30 bg-white/6 hover:bg-cyan-500 text-white rounded-full p-2 shadow-[0_6px_20px_rgba(6,182,212,0.12)] transition"
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         // dispatch global event so ProductList (or other parents) can open selected product
//                         window.dispatchEvent(new CustomEvent("open-product", { detail: r }));
//                       }}
//                     >
//                       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
//                         <circle cx="12" cy="12" r="10"></circle>
//                         <line x1="12" y1="8" x2="12" y2="12"></line>
//                         <line x1="12" y1="16" x2="12.01" y2="16"></line>
//                       </svg>
//                     </button>

//                     <img src={r.image} className="w-full h-32 object-cover rounded-lg" alt={r.name} />
//                     <div className="mt-2 text-sm font-bold text-white">{r.name}</div>
//                     <div className="text-xs text-slate-400">${r.price}</div>
//                     {r.why && <div className="mt-1 text-[10px] text-cyan-400">{r.why}</div>}
//                   </div>
//                 ))}
//               </div>
//             ) : (!recsLoading && <div className="text-slate-500">No recommendations</div>)}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


// // src/components/product/ProductDetailModal.tsx
// import { fetchHybridRecommendations } from "@/api/recommend";
// import { useAuth } from "@/store/authStore";
// import { useCart } from "@/store/cartStore";
// import type { Product } from "@/types";
// import { AnimatePresence, motion } from "framer-motion";
// import { CheckCircle, ChevronLeft, ChevronRight, MessageSquare, Radio, ShoppingCart, Sparkles, Star, X, Zap } from "lucide-react";
// import { useEffect, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";

// type Recommendation = Product & {
//   why?: string;
//   confidence?: number;
// };

// export default function ProductDetailModal({
//   product: initialProduct,
//   onClose,
// }: {
//   product: Product;
//   onClose: () => void;
// }) {
//   const [product, setProduct] = useState<Product>(initialProduct);
//   const scrollRef = useRef<HTMLDivElement>(null);
//   const recsScrollRef = useRef<HTMLDivElement>(null);

//   const { user, isLoggedIn } = useAuth();
//   const addItem = useCart((state) => state.addItem);
//   const currentQty = useCart((state) =>
//     state.items.find((item) => item.id === product.id)?.qty || 0
//   );
//   const [addedFeedback, setAddedFeedback] = useState(false);
//   const [recommendations, setRecommendations] = useState<Recommendation[] | null>(null);
//   const [recsLoading, setRecsLoading] = useState(false);

//   const userId = user?.id || 1;
//   const navigate = useNavigate();

//   const scrollRecs = (direction: 'left' | 'right') => {
//     if (recsScrollRef.current) {
//       const scrollAmount = 400;
//       recsScrollRef.current.scrollBy({
//         left: direction === 'left' ? -scrollAmount : scrollAmount,
//         behavior: 'smooth'
//       });
//     }
//   };

//   const handleProductChange = (newProduct: Product) => {
//     setProduct(newProduct);
//     if (scrollRef.current) {
//       scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
//     }
//   };

//   const handleBuyNow = () => {
//     addItem({ ...product, qty: 1 } as any);
//     isLoggedIn ? navigate("/checkout") : navigate("/checkout-gateway");
//   };

//   const handleAdd = () => {
//     addItem({ ...product, qty: 1 } as any);
//     setAddedFeedback(true);
//     setTimeout(() => setAddedFeedback(false), 1000);
//   };

//   useEffect(() => {
//     if (!product) return;
//     const controller = new AbortController();
//     let mounted = true;
//     setRecsLoading(true);
//     fetchHybridRecommendations(product.id, 6, controller.signal)
//       .then((json) => {
//         if (!mounted) return;
//         const recs = Array.isArray(json?.recommendations) ? json.recommendations : Array.isArray(json) ? json : [];
//         setRecommendations(recs);
//       })
//       .catch(() => mounted && setRecommendations([]))
//       .finally(() => mounted && setRecsLoading(false));
//     return () => { mounted = false; controller.abort(); };
//   }, [product, userId]);

//   const isSvg = typeof product.image === "string" && product.image.toLowerCase().endsWith(".svg");
//   const getVal = (val: any) => val || "Information not specified";

//   return (
//     <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
//       <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={onClose} />

//       <div className="relative z-10 w-full max-w-6xl max-h-[90vh] bg-slate-950 border border-cyan-500/30 rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col lg:flex-row">
//         <button onClick={onClose} className="absolute right-6 top-6 z-50 p-2.5 bg-black/40 backdrop-blur-sm border border-white/10 text-white rounded-full hover:bg-red-500 transition-all">
//           <X size={20} />
//         </button>

//         {/* IMAGE SECTION */}
//         <div className={`w-full lg:w-2/5 ${isSvg ? "min-h-[300px]" : "h-80 lg:h-auto"} relative bg-slate-900 flex-shrink-0 border-r border-white/5`}>
//           <AnimatePresence mode="wait">
//             <motion.img
//               key={product.id}
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 1.1 }}
//               src={product.image}
//               alt={product.name}
//               className={`w-full h-full ${isSvg ? "object-contain p-12" : "object-cover"}`}
//             />
//           </AnimatePresence>
//         </div>

//         {/* INFO SECTION */}
//         <div ref={scrollRef} className="flex-1 p-6 md:p-10 overflow-y-auto no-scrollbar relative min-h-0 bg-gradient-to-b from-slate-950 to-slate-900">
//           {/* 상단 브랜드 & 이름 */}
//           <div className="mb-8">
//             <div className="flex items-center gap-3 mb-4">
//               <span className="text-cyan-400 text-[10px] font-black tracking-[0.2em] uppercase px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-md">
//                 {getVal(product.brand)}
//               </span>
//               <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest italic">
//                 SYSTEM ID: {product.id}
//               </span>
//             </div>
//             <h2 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none mb-2">
//               {getVal(product.name)}
//             </h2>
//             <p className="text-cyan-500/60 font-mono text-sm uppercase tracking-tighter">
//               Category: {Array.isArray(product.categories) ? product.categories.join(" / ") : (product as any).category || "General Module"}
//             </p>
//           </div>

//           <div className="text-4xl font-black text-white mb-8 flex items-baseline gap-2">
//             <span className="text-lg font-light text-cyan-500">$</span>
//             {product.price?.toLocaleString() || "0"}
//           </div>

//           <div className="text-slate-400 text-sm leading-relaxed mb-10 max-w-2xl border-l-2 border-cyan-500/30 pl-4 py-1">
//             {getVal(product.description)}
//           </div>

//           {/* SPECIFICATIONS GRID */}
//           <div className="mb-10">
//             <h3 className="text-white text-xs font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
//               <Zap size={14} className="text-cyan-500" /> Technical Specs
//             </h3>
//             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//               {['driver', 'batteryLife', 'noiseCancellation', 'connectivity'].map((specKey) => (
//                 <div key={specKey} className="bg-white/5 border border-white/5 p-3 rounded-xl">
//                   <div className="text-[9px] text-slate-500 uppercase font-black mb-1">{specKey}</div>
//                   <div className="text-xs text-cyan-100 font-bold">
//                     {product.specs?.[specKey] || "Information not specified"}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* CONNECTIVITY */}
//           <div className="mb-10 bg-cyan-500/5 border border-cyan-500/10 p-4 rounded-2xl flex items-center gap-4">
//             <div className="p-3 bg-cyan-500/20 rounded-full text-cyan-400 font-bold">
//               <Radio size={20} />
//             </div>
//             <div>
//               <div className="text-[10px] text-cyan-500/70 font-black uppercase tracking-widest">Connection Protocol</div>
//               <div className="text-sm text-white font-bold">{getVal(product.connectivity)}</div>
//             </div>
//           </div>

//           {/* ACTION BUTTONS (반전 스타일) */}
//           <div className="flex flex-col sm:flex-row gap-4 mb-12">
//             <button
//               onClick={handleAdd}
//               disabled={addedFeedback}
//               className={`flex-1 py-5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all uppercase text-xs tracking-widest
//                 ${addedFeedback ? "bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]" : "bg-cyan-500 text-black hover:bg-white hover:text-black"}
//               `}
//             >
//               {addedFeedback ? <><CheckCircle size={18} /> Synced</> : <><ShoppingCart size={18} /> Add to Cart</>}
//             </button>
//             <button
//               onClick={handleBuyNow}
//               className="flex-1 py-5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all uppercase text-xs tracking-widest border border-cyan-500/30 bg-white text-black hover:bg-cyan-500 hover:text-white"
//             >
//               Buy Now
//             </button>
//           </div>

//           {/* REVIEWS SECTION */}
//           <div className="mb-12">
//             <h3 className="text-white text-xs font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
//               <MessageSquare size={14} className="text-cyan-500" /> User Feedback
//             </h3>
//             <div className="space-y-4">
//               {(product as any).reviews && (product as any).reviews.length > 0 ? (
//                 (product as any).reviews.map((rev: any) => (
//                   <div key={rev.id} className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl">
//                     <div className="flex justify-between items-center mb-2">
//                       <div className="flex gap-1 text-cyan-500">
//                         {[...Array(5)].map((_, i) => (
//                           <Star key={i} size={10} fill={i < rev.rating ? "currentColor" : "none"} className={i < rev.rating ? "" : "text-slate-700"} />
//                         ))}
//                       </div>
//                       <span className="text-[9px] text-slate-600 font-mono">{rev.date}</span>
//                     </div>
//                     <div className="text-sm font-bold text-white mb-1 uppercase italic tracking-tighter">{rev.title}</div>
//                     <p className="text-xs text-slate-400 leading-relaxed">{rev.body}</p>
//                   </div>
//                 ))
//               ) : (
//                 <div className="text-slate-600 text-xs italic p-4 border border-dashed border-white/5 rounded-2xl uppercase tracking-tighter">Information not specified</div>
//               )}
//             </div>
//           </div>

//           {/* RECOMMENDATIONS SECTION */}
//           <div className="border-t border-white/5 pt-8 relative">
//             <div className="flex items-center justify-between mb-8">
//               <h3 className="text-white text-[10px] font-black uppercase tracking-[0.4em] italic opacity-50">Related Modules</h3>

//               {/* 순수 SVG 네온 슬라이드 버튼 */}
//               <div className="flex gap-8 px-4">
//                 <button
//                   onClick={() => scrollRecs('left')}
//                   className="text-cyan-400 hover:text-white transition-all drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] hover:drop-shadow-[0_0_12px_rgba(255,255,255,1)]"
//                 >
//                   <ChevronLeft size={32} strokeWidth={2.5} />
//                 </button>
//                 <button
//                   onClick={() => scrollRecs('right')}
//                   className="text-cyan-400 hover:text-white transition-all drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] hover:drop-shadow-[0_0_12px_rgba(255,255,255,1)]"
//                 >
//                   <ChevronRight size={32} strokeWidth={2.5} />
//                 </button>
//               </div>
//             </div>

//             {recsLoading ? (
//               <div className="text-cyan-500 font-mono text-[10px] animate-pulse uppercase">Scanning Database...</div>
//             ) : (
//               <div
//                 ref={recsScrollRef}
//                 className="flex gap-6 overflow-x-auto no-scrollbar py-6 px-1 scroll-smooth"
//               >
//                 {recommendations?.map((r) => (
//                   <div key={r.id} className="w-56 shrink-0 relative bg-white/[0.03] p-5 rounded-3xl border border-white/5 hover:border-cyan-500/30 transition-all group">

//                     {/* FOR YOU 배지 (User Feedback 스타일로 변경) */}
//                     <div className="mb-4">
//                       <h4 className="text-cyan-400 text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5 shadow-cyan-500/20 drop-shadow-sm">
//                         <Sparkles size={12} className="text-cyan-400" /> FOR YOU
//                       </h4>
//                     </div>

//                     <button
//                       onClick={(e) => { e.stopPropagation(); handleProductChange(r); }}
//                       className="absolute top-4 right-4 z-30 px-3 py-1 bg-cyan-600 text-white text-[9px] font-black rounded-lg border border-cyan-400/50 hover:bg-white hover:text-black transition-all"
//                     >
//                       ACCESS
//                     </button>

//                     <div className="aspect-square rounded-2xl overflow-hidden bg-slate-900 mb-4">
//                       <img src={r.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={r.name} />
//                     </div>
//                     <div className="text-[11px] font-black text-white uppercase truncate mb-1 italic">{r.name}</div>
//                     <div className="text-[10px] font-mono text-cyan-500 mb-2">${r.price.toLocaleString()}</div>

//                     {/* 추천 사유 (why) */}
//                     <div className="mt-2 pt-2 border-t border-white/5">
//                       <p className="text-[9px] leading-tight text-slate-500 font-medium group-hover:text-cyan-300 transition-colors italic">
//                         {r.why || "Information not specified"}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
// src/components/product/ProductDetailModal.tsx
// import { fetchHybridRecommendations } from "@/api/recommend";
// import { useAuth } from "@/store/authStore";
// import { useCart } from "@/store/cartStore";
// import type { Product } from "@/types";
// import { AnimatePresence, motion } from "framer-motion";
// import { CheckCircle, ChevronLeft, ChevronRight, MessageSquare, Radio, ShoppingCart, Sparkles, Star, X, Zap } from "lucide-react";
// import { useEffect, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";

// type Recommendation = Product & {
//   why?: string;
//   confidence?: number;
// };

// export default function ProductDetailModal({
//   product: initialProduct,
//   onClose,
// }: {
//   product: Product;
//   onClose: () => void;
// }) {
//   const [product, setProduct] = useState<Product>(initialProduct);

//   const modalScrollRef = useRef<HTMLDivElement>(null);
//   const infoScrollRef = useRef<HTMLDivElement>(null);
//   const recsScrollRef = useRef<HTMLDivElement>(null);

//   const { user, isLoggedIn } = useAuth();
//   const addItem = useCart((state) => state.addItem);
//   const currentQty = useCart((state) =>
//     state.items.find((item) => item.id === product.id)?.qty || 0
//   );
//   const [addedFeedback, setAddedFeedback] = useState(false);
//   const [recommendations, setRecommendations] = useState<Recommendation[] | null>(null);
//   const [recsLoading, setRecsLoading] = useState(false);

//   const userId  = user?.id || 1;
//   const navigate = useNavigate();

//   const scrollRecs = (direction: 'left' | 'right') => {
//     if (recsScrollRef.current) {
//       const scrollAmount = 400;
//       recsScrollRef.current.scrollBy({
//         left: direction === 'left' ? -scrollAmount : scrollAmount,
//         behavior: 'smooth'
//       });
//     }
//   };

//   const handleProductChange = (newProduct: Product) => {
//     setProduct(newProduct);
//     if (modalScrollRef.current) {
//       modalScrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
//     }
//     if (infoScrollRef.current) {
//       infoScrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
//     }
//   };

//   const handleBuyNow = () => {
//     addItem({ ...product, qty: 1 } as any);
//     isLoggedIn ? navigate("/checkout") : navigate("/checkout-gateway");
//   };

//   const handleAdd = () => {
//     addItem({ ...product, qty: 1 } as any);
//     setAddedFeedback(true);
//     setTimeout(() => setAddedFeedback(false), 1000);
//   };

//   useEffect(() => {
//     if (!product) return;
//     const controller = new AbortController();
//     let mounted = true;
//     setRecsLoading(true);
//     fetchHybridRecommendations(product.id, 6, controller.signal)
//       .then((json) => {
//         if (!mounted) return;
//         const recs = Array.isArray(json?.recommendations) ? json.recommendations : Array.isArray(json) ? json : [];
//         setRecommendations(recs);
//       })
//       .catch(() => mounted && setRecommendations([]))
//       .finally(() => mounted && setRecsLoading(false));
//     return () => { mounted = false; controller.abort(); };
//   }, [product, userId]);

//   const isSvg = typeof product.image === "string" && product.image.toLowerCase().endsWith(".svg");
//   const getVal = (val: any) => val || "Information not specified";

//   return (
//     <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
//       <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl cursor-default" onClick={onClose} />

//       <div
//         ref={modalScrollRef}
//         className="relative z-10 w-full max-w-6xl max-h-[90vh] bg-gradient-to-b from-slate-950 to-slate-900 border border-cyan-500/30 rounded-[2rem] shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden no-scrollbar"
//       >
//         {/* CLOSE BUTTON */}
//         <div className="sticky top-6 right-6 z-50 flex justify-end w-full pointer-events-none pr-6 -mb-12 lg:absolute lg:top-6 lg:right-6 lg:mb-0 lg:pr-0">
//           <button
//             onClick={onClose}
//             className="pointer-events-auto p-3 bg-white/5 backdrop-blur-sm border border-white/10 text-cyan-400 rounded-full hover:bg-cyan-500/20 hover:text-cyan-300 hover:border-cyan-500/30 transition-all group shadow-lg cursor-pointer"
//           >
//             <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
//           </button>
//         </div>

//         {/* IMAGE SECTION */}
//         <div className={`w-full lg:w-2/5 ${isSvg ? "min-h-[300px]" : "h-80 lg:h-auto"} relative flex-shrink-0 border-r border-white/5`}>
//           <AnimatePresence mode="wait">
//             <motion.img
//               key={product.id}
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 1.1 }}
//               src={product.image}
//               alt={product.name}
//               className={`w-full h-full ${isSvg ? "object-contain p-12" : "object-cover"}`}
//             />
//           </AnimatePresence>
//         </div>

//         {/* INFO SECTION */}
//         <div
//           ref={infoScrollRef}
//           className="flex-1 p-6 md:p-10 relative min-h-0 lg:overflow-y-auto lg:no-scrollbar"
//         >
//           {/* Header Info */}
//           <div className="mb-8">
//             <div className="flex items-center gap-3 mb-4">
//               <span className="text-cyan-400 text-[10px] font-black tracking-[0.2em] uppercase px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-md">
//                 {getVal(product.brand)}
//               </span>
//               <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest italic">
//                 SYSTEM ID: {product.id}
//               </span>
//             </div>
//             <h2 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none mb-2">
//               {getVal(product.name)}
//             </h2>
//             <p className="text-cyan-500/60 font-mono text-sm uppercase tracking-tighter">
//               Category: {Array.isArray(product.categories) ? product.categories.join(" / ") : (product as any).category || "General Module"}
//             </p>
//           </div>

//           <div className="text-4xl font-black text-white mb-8 flex items-baseline gap-2">
//             <span className="text-lg font-light text-cyan-500">$</span>
//             {product.price?.toLocaleString() || "0"}
//           </div>

//           <div className="text-slate-400 text-sm leading-relaxed mb-10 max-w-2xl border-l-2 border-cyan-500/30 pl-4 py-1">
//             {getVal(product.description)}
//           </div>

//           {/* Specs */}
//           <div className="mb-10">
//             <h3 className="text-white text-xs font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
//               <Zap size={14} className="text-cyan-500" /> Technical Specs
//             </h3>
//             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//               {['driver', 'batteryLife', 'noiseCancellation', 'connectivity'].map((specKey) => (
//                 <div key={specKey} className="bg-white/5 border border-white/5 p-3 rounded-xl">
//                   <div className="text-[9px] text-slate-500 uppercase font-black mb-1">{specKey}</div>
//                   <div className="text-xs text-cyan-100 font-bold">
//                     {product.specs?.[specKey] || "Information not specified"}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Connectivity */}
//           <div className="mb-10 bg-cyan-500/5 border border-cyan-500/10 p-4 rounded-2xl flex items-center gap-4">
//             <div className="p-3 bg-cyan-500/20 rounded-full text-cyan-400 font-bold">
//               <Radio size={20} />
//             </div>
//             <div>
//               <div className="text-[10px] text-cyan-500/70 font-black uppercase tracking-widest">Connection Protocol</div>
//               <div className="text-sm text-white font-bold">{getVal(product.connectivity)}</div>
//             </div>
//           </div>

//           {/* Buttons */}
//           <div className="flex flex-col sm:flex-row gap-4 mb-12">
//             <button
//               onClick={handleAdd}
//               disabled={addedFeedback}
//               className={`cursor-pointer flex-1 py-5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all uppercase text-xs tracking-widest
//                 ${addedFeedback ? "bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]" : "bg-cyan-500 text-black hover:bg-white hover:text-black"}
//               `}
//             >
//               {addedFeedback ? <><CheckCircle size={18} /> Synced</> : <><ShoppingCart size={18} /> Add to Cart</>}
//             </button>
//             <button
//               onClick={handleBuyNow}
//               className="cursor-pointer flex-1 py-5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all uppercase text-xs tracking-widest border border-cyan-500/30 bg-white text-black hover:bg-cyan-500 hover:text-white"
//             >
//               Buy Now
//             </button>
//           </div>

//           {/* Reviews */}
//           <div className="mb-12">
//             <h3 className="text-white text-xs font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
//               <MessageSquare size={14} className="text-cyan-500" /> User Feedback
//             </h3>
//             <div className="space-y-4">
//               {(product as any).reviews && (product as any).reviews.length > 0 ? (
//                 (product as any).reviews.map((rev: any) => (
//                   <div key={rev.id} className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl">
//                     <div className="flex justify-between items-center mb-2">
//                       <div className="flex gap-1 text-cyan-500">
//                         {[...Array(5)].map((_, i) => (
//                           <Star key={i} size={10} fill={i < rev.rating ? "currentColor" : "none"} className={i < rev.rating ? "" : "text-slate-700"} />
//                         ))}
//                       </div>
//                       <span className="text-[9px] text-slate-600 font-mono">{rev.date}</span>
//                     </div>
//                     <div className="text-sm font-bold text-white mb-1 uppercase italic tracking-tighter">{rev.title}</div>
//                     <p className="text-xs text-slate-400 leading-relaxed">{rev.body}</p>
//                   </div>
//                 ))
//               ) : (
//                 <div className="text-slate-600 text-xs italic p-4 border border-dashed border-white/5 rounded-2xl uppercase tracking-tighter">Information not specified</div>
//               )}
//             </div>
//           </div>

//           {/* RECOMMENDATIONS SECTION */}
//           <div className="border-t border-white/5 pt-8 relative">
//             <div className="flex items-center justify-between mb-8">
//               <h3 className="text-white text-[10px] font-black uppercase tracking-[0.4em] italic opacity-50">Related Modules</h3>

//               <div className="flex gap-8 px-4">
//                 <button
//                   onClick={() => scrollRecs('left')}
//                   className="cursor-pointer text-cyan-400 hover:text-white transition-all drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] hover:drop-shadow-[0_0_12px_rgba(255,255,255,1)]"
//                 >
//                   <ChevronLeft size={32} strokeWidth={2.5} />
//                 </button>
//                 <button
//                   onClick={() => scrollRecs('right')}
//                   className="cursor-pointer text-cyan-400 hover:text-white transition-all drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] hover:drop-shadow-[0_0_12px_rgba(255,255,255,1)]"
//                 >
//                   <ChevronRight size={32} strokeWidth={2.5} />
//                 </button>
//               </div>
//             </div>

//             {recsLoading ? (
//               <div className="text-cyan-500 font-mono text-[10px] animate-pulse uppercase">Scanning Database...</div>
//             ) : (
//               <div
//                 ref={recsScrollRef}
//                 className="flex gap-6 overflow-x-auto no-scrollbar py-6 px-1 scroll-smooth"
//               >
//                 {recommendations?.map((r) => (
//                   <div
//                     key={r.id}
//                     // 2) 추천 상품 네온 효과: hover 시 border 색상 변경 + shadow 추가
//                     className="w-56 shrink-0 relative bg-white/[0.03] p-5 rounded-3xl border border-white/5
//                                hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]
//                                transition-all duration-300 group"
//                   >

//                     {/* FOR YOU 배지: 3) 글자 크기 반응형 (text-[10px] -> sm:text-xs) */}
//                     <div className="mb-4">
//                       <h4 className="text-cyan-400 text-[10px] sm:text-xs font-light uppercase tracking-[0.2em] flex items-center gap-1.5 shadow-cyan-500/20 drop-shadow-sm">
//                         <Sparkles size={14} className="text-cyan-400" /> FOR YOU
//                       </h4>
//                     </div>

//                     {/* ACCESS 버튼 */}
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         handleProductChange(r);
//                       }}
//                       // 1) 커서 포인터(cursor-pointer)
//                       // 3) 크기 반응형: 모바일(px-2 py-1) -> 데스크탑(sm:px-3 sm:py-1.5), 폰트도 반응형
//                       className="absolute top-3 right-4 z-30 cursor-pointer overflow-hidden rounded-lg font-medium uppercase tracking-widest transition-all duration-300
//                                  bg-white/5 ring-[0.5px] ring-white/10 text-slate-200
//                                  hover:bg-cyan-500 hover:text-black hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]
//                                  group/btn flex items-center justify-center
//                                  px-2 py-1 text-[10px] sm:px-3 sm:py-1.5 sm:text-xs"
//                     >
//                       <span className="relative z-10 flex items-center gap-1 cursor-pointer">
//                         ACCESS
//                       </span>
//                     </button>

//                     <div className="aspect-square rounded-2xl overflow-hidden bg-slate-900 mt-8 mb-4">
//                       <img src={r.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={r.name} />
//                     </div>
//                     <div className="text-[11px] font-black text-white uppercase truncate mb-1 italic">{r.name}</div>
//                     <div className="text-[10px] font-mono text-cyan-500 mb-2">${r.price.toLocaleString()}</div>

//                     <div className="mt-2 pt-2 border-t border-white/5">
//                       <p className="text-[9px] leading-tight text-slate-500 font-medium group-hover:text-cyan-300 transition-colors italic">
//                         {r.why || "Information not specified"}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
// src/components/product/ProductDetailModal.tsx
import { fetchHybridRecommendations } from "@/api/recommend";
import { useAuth } from "@/store/authStore";
import { useCart } from "@/store/cartStore";
import type { Product } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, ChevronLeft, ChevronRight, MessageSquare, Radio, ShoppingCart, Sparkles, Star, X, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

type Recommendation = Product & {
  why?: string;
  confidence?: number;
};

export default function ProductDetailModal({
  product: initialProduct,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const [product, setProduct] = useState<Product>(initialProduct);

  const modalScrollRef = useRef<HTMLDivElement>(null);
  const infoScrollRef = useRef<HTMLDivElement>(null);
  const recsScrollRef = useRef<HTMLDivElement>(null);

  const { user, isLoggedIn } = useAuth();
  const addItem = useCart((state) => state.addItem);
  const currentQty = useCart((state) =>
    state.items.find((item) => item.id === product.id)?.qty || 0
  );
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[] | null>(null);
  const [recsLoading, setRecsLoading] = useState(false);

  const userId  = user?.id || 1;
  const navigate = useNavigate();

  const scrollRecs = (direction: 'left' | 'right') => {
    if (recsScrollRef.current) {
      const scrollAmount = 400;
      recsScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleProductChange = (newProduct: Product) => {
    setProduct(newProduct);
    if (modalScrollRef.current) {
      modalScrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
    if (infoScrollRef.current) {
      infoScrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBuyNow = () => {
    addItem({ ...product, qty: 1 } as any);
    isLoggedIn ? navigate("/checkout") : navigate("/checkout-gateway");
  };

  const handleAdd = () => {
    addItem({ ...product, qty: 1 } as any);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1000);
  };

  // [추가됨] 모달이 열려있는 동안 Body 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  useEffect(() => {
    if (!product) return;
    const controller = new AbortController();
    let mounted = true;
    setRecsLoading(true);
    fetchHybridRecommendations(product.id, 6, controller.signal)
      .then((json) => {
        if (!mounted) return;
        const recs = Array.isArray(json?.recommendations) ? json.recommendations : Array.isArray(json) ? json : [];
        setRecommendations(recs);
      })
      .catch(() => mounted && setRecommendations([]))
      .finally(() => mounted && setRecsLoading(false));
    return () => { mounted = false; controller.abort(); };
  }, [product, userId]);

  const isSvg = typeof product.image === "string" && product.image.toLowerCase().endsWith(".svg");
  const getVal = (val: any) => val || "Information not specified";

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl cursor-default" onClick={onClose} />

      <div
        ref={modalScrollRef}
        className="relative z-10 w-full max-w-6xl max-h-[90vh] bg-gradient-to-b from-slate-950 to-slate-900 border border-cyan-500/30 rounded-[2rem] shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden no-scrollbar"
      >
        {/* CLOSE BUTTON */}
        <div className="sticky top-6 right-6 z-50 flex justify-end w-full pointer-events-none pr-6 -mb-12 lg:absolute lg:top-6 lg:right-6 lg:mb-0 lg:pr-0">
          <button
            onClick={onClose}
            className="pointer-events-auto p-3 bg-white/5 backdrop-blur-sm border border-white/10 text-cyan-400 rounded-full hover:bg-cyan-500/20 hover:text-cyan-300 hover:border-cyan-500/30 transition-all group shadow-lg cursor-pointer"
          >
            <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* IMAGE SECTION */}
        <div className={`w-full lg:w-2/5 ${isSvg ? "min-h-[300px]" : "h-80 lg:h-auto"} relative flex-shrink-0 border-r border-white/5`}>
          <AnimatePresence mode="wait">
            <motion.img
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              src={product.image}
              alt={product.name}
              className={`w-full h-full ${isSvg ? "object-contain p-12" : "object-cover"}`}
            />
          </AnimatePresence>
        </div>

        {/* INFO SECTION */}
        <div
          ref={infoScrollRef}
          className="flex-1 p-6 md:p-10 relative min-h-0 lg:overflow-y-auto lg:no-scrollbar"
        >
          {/* Header Info */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-cyan-400 text-[10px] font-black tracking-[0.2em] uppercase px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-md">
                {getVal(product.brand)}
              </span>
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest italic">
                SYSTEM ID: {product.id}
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none mb-2">
              {getVal(product.name)}
            </h2>
            <p className="text-cyan-500/60 font-mono text-sm uppercase tracking-tighter">
              Category: {Array.isArray(product.categories) ? product.categories.join(" / ") : (product as any).category || "General Module"}
            </p>
          </div>

          <div className="text-4xl font-black text-white mb-8 flex items-baseline gap-2">
            <span className="text-lg font-light text-cyan-500">$</span>
            {product.price?.toLocaleString() || "0"}
          </div>

          <div className="text-slate-400 text-sm leading-relaxed mb-10 max-w-2xl border-l-2 border-cyan-500/30 pl-4 py-1">
            {getVal(product.description)}
          </div>

          {/* Specs */}
          <div className="mb-10">
            <h3 className="text-white text-xs font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
              <Zap size={14} className="text-cyan-500" /> Technical Specs
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {['driver', 'batteryLife', 'noiseCancellation', 'connectivity'].map((specKey) => (
                <div key={specKey} className="bg-white/5 border border-white/5 p-3 rounded-xl">
                  <div className="text-[9px] text-slate-500 uppercase font-black mb-1">{specKey}</div>
                  <div className="text-xs text-cyan-100 font-bold">
                    {product.specs?.[specKey] || "Information not specified"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Connectivity */}
          <div className="mb-10 bg-cyan-500/5 border border-cyan-500/10 p-4 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-cyan-500/20 rounded-full text-cyan-400 font-bold">
              <Radio size={20} />
            </div>
            <div>
              <div className="text-[10px] text-cyan-500/70 font-black uppercase tracking-widest">Connection Protocol</div>
              <div className="text-sm text-white font-bold">{getVal(product.connectivity)}</div>
            </div>
          </div>

          {/* Buttons - Redesigned Colors */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            {/* ADD TO CART BUTTON */}
            <button
              onClick={handleAdd}
              disabled={addedFeedback}
              className={`cursor-pointer flex-1 py-5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all uppercase text-xs tracking-widest border
                ${addedFeedback
                  ? "bg-emerald-500 border-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                  : "bg-slate-950 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 hover:border-cyan-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                }
              `}
            >
              {addedFeedback ? <><CheckCircle size={18} /> Synced</> : <><ShoppingCart size={18} /> Add to Cart</>}
            </button>

            {/* BUY NOW BUTTON */}
            <button
              onClick={handleBuyNow}
              className="cursor-pointer flex-1 py-5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all uppercase text-xs tracking-widest
                bg-white text-slate-950 border border-white shadow-[0_0_10px_rgba(255,255,255,0.3)]
                hover:bg-cyan-400 hover:text-slate-950 hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(34,211,238,0.6)]"
            >
              Buy Now
            </button>
          </div>

          {/* Reviews */}
          <div className="mb-12">
            <h3 className="text-white text-xs font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
              <MessageSquare size={14} className="text-cyan-500" /> User Feedback
            </h3>
            <div className="space-y-4">
              {(product as any).reviews && (product as any).reviews.length > 0 ? (
                (product as any).reviews.map((rev: any) => (
                  <div key={rev.id} className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex gap-1 text-cyan-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={10} fill={i < rev.rating ? "currentColor" : "none"} className={i < rev.rating ? "" : "text-slate-700"} />
                        ))}
                      </div>
                      <span className="text-[9px] text-slate-600 font-mono">{rev.date}</span>
                    </div>
                    <div className="text-sm font-bold text-white mb-1 uppercase italic tracking-tighter">{rev.title}</div>
                    <p className="text-xs text-slate-400 leading-relaxed">{rev.body}</p>
                  </div>
                ))
              ) : (
                <div className="text-slate-600 text-xs italic p-4 border border-dashed border-white/5 rounded-2xl uppercase tracking-tighter">Information not specified</div>
              )}
            </div>
          </div>

          {/* RECOMMENDATIONS SECTION */}
          <div className="border-t border-white/5 pt-8 relative">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-white text-[10px] font-black uppercase tracking-[0.4em] italic opacity-50">Related Modules</h3>

              <div className="flex gap-8 px-4">
                <button
                  onClick={() => scrollRecs('left')}
                  className="cursor-pointer text-cyan-400 hover:text-white transition-all drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] hover:drop-shadow-[0_0_12px_rgba(255,255,255,1)]"
                >
                  <ChevronLeft size={32} strokeWidth={2.5} />
                </button>
                <button
                  onClick={() => scrollRecs('right')}
                  className="cursor-pointer text-cyan-400 hover:text-white transition-all drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] hover:drop-shadow-[0_0_12px_rgba(255,255,255,1)]"
                >
                  <ChevronRight size={32} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {recsLoading ? (
              <div className="text-cyan-500 font-mono text-[10px] animate-pulse uppercase">Scanning Database...</div>
            ) : (
              <div
                ref={recsScrollRef}
                className="flex gap-6 overflow-x-auto no-scrollbar py-6 px-1 scroll-smooth"
              >
                {recommendations?.map((r) => (
                  <div
                    key={r.id}
                    // 2) 추천 상품 네온 효과: hover 시 border 색상 변경 + shadow 추가
                    className="w-56 shrink-0 relative bg-white/[0.03] p-5 rounded-3xl border border-white/5
                               hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]
                               transition-all duration-300 group"
                  >

                    {/* FOR YOU 배지: 3) 글자 크기 반응형 (text-[10px] -> sm:text-xs) */}
                    <div className="mb-4">
                      <h4 className="text-cyan-400 text-[10px] sm:text-xs font-light uppercase tracking-[0.2em] flex items-center gap-1.5 shadow-cyan-500/20 drop-shadow-sm">
                        <Sparkles size={14} className="text-cyan-400" /> FOR YOU
                      </h4>
                    </div>

                    {/* ACCESS 버튼 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductChange(r);
                      }}
                      // 1) 커서 포인터(cursor-pointer)
                      // 3) 크기 반응형: 모바일(px-2 py-1) -> 데스크탑(sm:px-3 sm:py-1.5), 폰트도 반응형
                      className="absolute top-3 right-4 z-30 cursor-pointer overflow-hidden rounded-lg font-medium uppercase tracking-widest transition-all duration-300
                                 bg-white/5 ring-[0.5px] ring-white/10 text-slate-200
                                 hover:bg-cyan-500 hover:text-black hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]
                                 group/btn flex items-center justify-center
                                 px-2 py-1 text-[10px] sm:px-3 sm:py-1.5 sm:text-xs"
                    >
                      <span className="relative z-10 flex items-center gap-1 cursor-pointer">
                        ACCESS
                      </span>
                    </button>

                    <div className="aspect-square rounded-2xl overflow-hidden bg-slate-900 mt-8 mb-4">
                      <img src={r.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={r.name} />
                    </div>
                    <div className="text-[11px] font-black text-white uppercase truncate mb-1 italic">{r.name}</div>
                    <div className="text-[10px] font-mono text-cyan-500 mb-2">${r.price.toLocaleString()}</div>

                    <div className="mt-2 pt-2 border-t border-white/5">
                      <p className="text-[9px] leading-tight text-slate-500 font-medium group-hover:text-cyan-300 transition-colors italic">
                        {r.why || "Information not specified"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
