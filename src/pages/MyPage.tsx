
// // src/pages/MyPage.tsx

// "use client";

// import { fetchHybridRecommendations } from "@/api/recommend";
// import { useUserStore } from "@/store/userStore";
// import type { Product } from "@/types";
// import { motion } from "framer-motion"; // 애니메이션 추가
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// // 컴포넌트 임포트
// import ProductCard from "@/components/product/ProductCard";
// import ProductDetailModal from "@/components/product/ProductDetailModal";

// // 아이콘 임포트
// import {
//   Activity,
//   ChevronRight,
//   ExternalLink,
//   History,
//   Package,
//   Settings,
//   Sparkles,
//   UserCircle2
// } from "lucide-react";

// interface MyPageProps {
//   currentUser: {
//     id: string;
//     name: string;
//     email: string;
//     phone?: string;
//   };
// }

// export default function MyPage({ currentUser }: MyPageProps) {
//   const navigate = useNavigate();
//   const { orders } = useUserStore();
//   const [recs, setRecs] = useState<any[]>([]);
//   const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
//   const [loading, setLoading] = useState(true);

//   // 🛡️ 방어 코드
//   if (!currentUser) {
//     return (
//       <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-cyan-500 gap-4">
//         <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
//         <span className="font-mono text-xs tracking-[0.2em] animate-pulse">INITIALIZING NEURAL LINK...</span>
//       </div>
//     );
//   }

//   // AI 학습 데이터 전송
//   export async function createOrder(payload) {
//   const res = await fetch("/api/orders", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(payload),
//   });
//   if (!res.ok) {
//     const text = await res.text();
//     throw new Error(`Order create failed: ${res.status} ${text}`);
//   }
//   return res.json();
// }
// const payload = {
//   userId: Number(currentUser.id),
//   items: [{ productId: product.id, qty: 1, price: product.price }],
// };
// const order = await createOrder(payload);

// const syncOrderFeedback = async (orderId: string) => {
//   try {
//     const payload = {
//       // currentUser.id가 숫자 형태가 아니라면 Number()를 제거하세요.
//       userId: currentUser.id,
//       // orderId가 "ORD-MQHU" 형태라면 Number()를 제거해야 합니다.
//       orderId: orderId,
//       action: "view_details",
//     };

//     console.log("AI feedback payload:", payload); // 여기서 NaN이 찍히는지 확인해보세요.

//     const res = await fetch("/api/ai/feedback", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload),
//     });
//     // ... 후속 처리
//   } catch (error) {
//     console.error("AI Sync Failed:", error);
//   }
// };

//   /**
//    * createOrder
//    * - 백엔드에 /api/orders POST 요청을 보냄
//    * - 404/실패 시 간단한 mock 주문을 생성해 반환 (개발용 폴백)
//    */
//   const createOrder = async (items: { productId: number; qty: number }[]) => {
//     const userIdNum = Number(currentUser.id);
//     if (!Number.isFinite(userIdNum)) {
//       throw new Error(`Invalid user id: ${currentUser.id}`);
//     }

//     const payload = {
//       userId: userIdNum,
//       items,
//       // 필요 시 추가 필드를 여기에 넣으세요 (address, payment 등)
//     };

//     try {
//       const res = await fetch("/api/orders", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       const text = await res.text();
//       // 서버가 JSON을 반환하지 않거나 에러 텍스트를 반환할 수 있으므로 안전하게 처리
//       try {
//         const data = text ? JSON.parse(text) : null;
//         if (!res.ok) {
//           console.warn("createOrder backend returned non-ok:", res.status, data);
//           // fallthrough to mock
//         } else {
//           return data;
//         }
//       } catch (parseErr) {
//         console.warn("createOrder: failed to parse backend response", parseErr, text);
//         // fallthrough to mock
//       }
//     } catch (err) {
//       console.warn("createOrder: backend request failed", err);
//       // fallthrough to mock
//     }

//     // --- 개발 폴백: mock 주문 ---
//     const mockOrder = {
//       id: Date.now(),
//       total: items.reduce((s, it) => s + (it.qty || 1) * 1000, 0), // 단순 총액 계산 (임시)
//       status: "CREATED",
//       items,
//     };
//     console.info("createOrder: returning mock order", mockOrder);
//     return mockOrder;
//   };

//   /**
//    * handlePlaceOrder
//    * - createOrder 호출
//    * - createOrder 성공 후 syncOrderFeedback 호출 (동기)
//    * - 주문 상세 페이지로 이동
//    */
//   const handlePlaceOrder = async (items: { productId: number; qty: number }[]) => {
//     try {
//       const order = await createOrder(items);
//       console.log("Order created:", order);

//       // 주문 생성 직후 AI 피드백(동기)
//       if (order && order.id != null) {
//         await syncOrderFeedback(String(order.id));
//       } else {
//         console.warn("handlePlaceOrder: order has no id, skipping syncOrderFeedback", order);
//       }

//       // 주문 상세 페이지로 이동 (필요하면)
//       if (order && order.id != null) {
//         navigate(`/orders/${order.id}`);
//       }
//     } catch (e) {
//       console.error("Order failed:", e);
//       // UI에서 토스트/모달로 사용자에게 알리도록 구현하세요.
//     }
//   };

//   useEffect(() => {
//     const loadRecs = async () => {
//       setLoading(true);
//       try {
//         // 안전하게 시드 아이디 가져오기 (orders나 items가 없을 수 있으니 체크)
//         const seedId =
//           orders && orders.length > 0 && orders[0].items && orders[0].items.length > 0
//             ? orders[0].items[0].id
//             : 1;
//         const data = await fetchHybridRecommendations(seedId, 4);
//         const products = Array.isArray(data) ? data : data?.recommendations || [];
//         setRecs(products);
//       } catch (error) {
//         console.error("Failed to load recommendations:", error);
//         setRecs([]);
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadRecs();
//   }, [orders]);

//   // 애니메이션 변수
//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: { staggerChildren: 0.1 }
//     }
//   };

//   const itemVariants = {
//     hidden: { opacity: 0, y: 20 },
//     visible: { opacity: 1, y: 0 }
//   };
// // 테스트 주문: recs의 첫 번째 상품을 1개 주문하는 예시
//   const placeTestOrderFromFirstRec = () => {
//     const firstProduct = recs && recs.length > 0 ? recs[0] : null;
//     const items = firstProduct ? [{ productId: firstProduct.id, qty: 1 }] : [{ productId: 1, qty: 1 }];
//     handlePlaceOrder(items);
//   };
//   return (
//     <div className="min-h-screen text-slate-200 selection:bg-cyan-500/30 relative font-sans bg-slate-950 overflow-hidden">
//       {/* Background Effect (CartPage와 통일) */}
//       <div className="fixed inset-0 bg-[url('/circuit-board.svg')] bg-center opacity-5 mix-blend-screen pointer-events-none z-0" />

//       {/* Main Container */}
//       <motion.div
//         variants={containerVariants}
//         initial="hidden"
//         animate="visible"
//         className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-14 relative z-10 space-y-12 sm:space-y-16"
//       >
//         {/* SECTION 1: HEADER (Command Center Style) */}
//         <motion.header variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
//           <div className="flex items-start gap-4 sm:gap-6">
//             {/* Avatar Section */}
//             <div className="relative group">
//               <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.1)] group-hover:shadow-[0_0_50px_rgba(6,182,212,0.2)] transition-all duration-500">
//                 <span className="text-3xl sm:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-tr from-cyan-400 to-white">
//                   {currentUser.name[0]}
//                 </span>
//               </div>
//               <div className="absolute -bottom-2 -right-2 bg-slate-950 p-1 rounded-full border border-white/10">
//                 <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-emerald-500 animate-pulse" />
//               </div>
//             </div>

//             <div className="flex flex-col">
//               {/* Badge */}
//               <div className="flex items-center gap-3 mb-2">
//                 <span className="text-cyan-400 text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded-md flex items-center gap-2">
//                   <UserCircle2 size={12} /> Citizen ID: {currentUser.id}
//                 </span>
//               </div>

//               {/* Name Title */}
//               <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-white italic tracking-tighter uppercase leading-[0.9]">
//                 {currentUser.name}
//               </h1>

//               {/* Email Subtitle */}
//               <p className="text-slate-500 font-mono text-[10px] sm:text-xs uppercase tracking-widest mt-2 pl-1 flex items-center gap-2">
//                 {currentUser.email}
//               </p>
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex gap-4 w-full md:w-auto justify-end">
//             <button className="p-3 sm:p-4 bg-white/5 rounded-xl hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-400 transition-all border border-white/5 group">
//               <Settings size={20} className="text-slate-400 group-hover:text-cyan-400 group-hover:rotate-90 transition-transform duration-500" />
//             </button>
//           </div>
//         </motion.header>

//         {/* SECTION 2: Recent Operations (Orders) */}
//         <motion.section variants={itemVariants} className="space-y-6 sm:space-y-8">
//           <div className="flex items-center gap-3 border-b border-white/5 pb-4">
//             <Package className="text-cyan-500" size={24} />
//             <h2 className="text-xl sm:text-2xl font-black uppercase italic tracking-tight text-white">
//               Recent Operations
//             </h2>
//             <span className="ml-auto text-[10px] font-mono text-slate-500 uppercase tracking-widest hidden sm:block">
//                // Transaction History
//             </span>
//           </div>

//           <div className="grid grid-cols-1 gap-4">
//             {orders && orders.length === 0 ? (
//                <div className="p-16 text-center bg-white/5 rounded-[2rem] border border-dashed border-white/10 flex flex-col items-center gap-4">
//                  <History className="text-slate-700" size={48} />
//                  <p className="text-slate-500 font-black uppercase tracking-widest text-sm">No transaction data found.</p>
//                </div>
//             ) : (
//               orders?.map((order: any) => (
//                 <div
//                   key={order.id}
//                   className="group relative bg-white/[0.02] border border-white/5 p-5 sm:p-6 rounded-[1.5rem] hover:border-cyan-500/30 hover:bg-white/[0.04] transition-all duration-300 flex flex-col sm:flex-row justify-between sm:items-center gap-6 overflow-hidden"
//                 >
//                   <div className="flex items-start sm:items-center gap-5 sm:gap-8 z-10">
//                     {/* Order ID Box */}
//                     <div className="p-3 sm:p-4 border border-white/10 rounded-xl group-hover:border-cyan-500/20 transition-colors">
//                       <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Order ID</div>
//                       <div className="font-mono text-cyan-400 font-bold text-sm sm:text-base tracking-wider">#{order.id.toString().slice(0, 8)}</div>
//                     </div>

//                     <div className="flex flex-col">
//                         <div className="flex items-baseline gap-1">
//                              <span className="text-sm font-light text-cyan-500">$</span>
//                              <span className="text-lg sm:text-2xl font-black text-white italic tracking-tight">{order.total.toLocaleString()}</span>
//                         </div>
//                         <div className="flex items-center gap-2 mt-1">
//                             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
//                             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{order.status}</span>
//                         </div>
//                     </div>
//                   </div>

//                   <button
//                     onClick={() => {
//                       syncOrderFeedback(order.id.toString());
//                       navigate(`/orders/${order.id}`);
//                     }}
//                     className="
//                       relative overflow-hidden rounded-xl font-bold uppercase tracking-widest transition-all duration-300
//                       bg-white/5 border border-white/10 text-slate-200
//                       hover:bg-cyan-500 hover:text-black hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]
//                       group/btn flex items-center justify-center cursor-pointer w-full sm:w-auto px-6 py-3 text-xs z-10
//                     "
//                   >
//                      <span className="relative z-10 flex items-center gap-2">
//                         Details <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
//                      </span>
//                   </button>

//                   {/* Hover Gradient Effect */}
//                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
//                 </div>
//               ))
//             )}
//           </div>
//         </motion.section>

//         {/* SECTION 3: Neural Recommendations */}
//         <motion.section variants={itemVariants} className="pt-8 border-t border-white/5">
//           <div className="flex items-center justify-between mb-8">
//             <h2 className="text-xl sm:text-2xl font-black uppercase italic flex items-center gap-3 tracking-tight text-white">
//                 <Sparkles className="text-cyan-400" fill="currentColor" size={20} /> Neural Recommendations
//             </h2>
//             <div className="hidden sm:block text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
//                 <Activity size={12} className="animate-pulse text-emerald-500" />
//                 System Optimized
//             </div>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
//             {loading ? (
//               [1, 2, 3, 4].map(i => (
//                   <div key={i} className="aspect-[3/4] bg-white/5 rounded-[1.5rem] animate-pulse border border-white/5" />
//               ))
//             ) : (
//               recs.map((product) => (
//                 <div key={product.id} className="flex flex-col gap-3 group">
//                   {/* Card Wrapper to match grid height */}
//                   <div className="relative h-full">
//                       <ProductCard
//                         product={product}
//                         onOpen={(p: Product) => setSelectedProduct(p)}
//                       />
//                   </div>

//                   {/* AI Why Label - Styled like a system log */}
//                   {product.why && (
//                     <motion.div
//                         initial={{ opacity: 0, y: 10 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         className="px-3 py-2 bg-slate-900/80 border border-cyan-500/20 rounded-lg flex items-start gap-2 backdrop-blur-md"
//                     >
//                       <ExternalLink size={10} className="text-cyan-500 mt-0.5 shrink-0" />
//                       <p className="text-[9px] text-cyan-100 font-mono uppercase leading-tight line-clamp-2">
//                         <span className="text-cyan-400 font-bold mr-1">AI_REASON:</span>
//                         {product.why}
//                       </p>
//                     </motion.div>
//                   )}
//                 </div>
//               ))
//             )}
//           </div>
//         </motion.section>

//       </motion.div>

//       {/* Modal */}
//       {selectedProduct && (
//         <ProductDetailModal
//           product={selectedProduct}
//           onClose={() => setSelectedProduct(null)}
//         />
//       )}
//     </div>
//   );
// }
// src/pages/MyPage.tsx

// src/pages/MyPage.tsx

"use client";

import { fetchHybridRecommendations } from "@/api/recommend";
import { useUserStore } from "@/store/userStore";
import type { Product } from "@/types";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// 컴포넌트 임포트
import ProductCard from "@/components/product/ProductCard";
import ProductDetailModal from "@/components/product/ProductDetailModal";

// 아이콘 임포트
import {
  Activity,
  ChevronRight,
  ExternalLink,
  History,
  Package,
  Settings,
  Sparkles,
  UserCircle2
} from "lucide-react";

interface MyPageProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

export default function MyPage({ currentUser }: MyPageProps) {
  const navigate = useNavigate();
  const { orders } = useUserStore();
  const [recs, setRecs] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // 🛡️ 방어 코드
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-cyan-500 gap-4">
        <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <span className="font-mono text-xs tracking-[0.2em] animate-pulse">INITIALIZING NEURAL LINK...</span>
      </div>
    );
  }

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

  // replace existing syncOrderFeedback with this
  const syncOrderFeedback = async (orderId: string | number) => {
    // [헬퍼 함수] 숫자 변환 시도: 숫자면 숫자로, 아니면 원래 값 반환
    const ensureNumber = (val: any) => {
      if (val === null || val === undefined) return null;
      const num = Number(val);
      return !isNaN(num) && Number.isFinite(num) ? num : val;
    };

    const userId = ensureNumber(currentUser?.id);
    const safeOrderId = ensureNumber(orderId);

    // [방어 코드] ID가 하나라도 없으면 요청 보내지 않음
    if (!userId || !safeOrderId) {
      console.warn("syncOrderFeedback 중단: user_id 또는 order_id가 유효하지 않습니다.", { userId, safeOrderId });
      return { ok: false };
    }

    // 전송할 데이터 payload
    const payload = {
      action: "view_details",
      sent_at: new Date().toISOString(),
      user_id: userId,
      order_id: safeOrderId,
    };

    console.log("AI 피드백 전송 시도:", payload);

    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // 응답 처리
      if (!res.ok) {
        const errText = await res.text();
        try {
          const errJson = JSON.parse(errText);
          console.error(`AI 피드백 실패 (${res.status}):`, errJson);
        } catch {
          console.error(`AI 피드백 실패 (${res.status}):`, errText);
        }
        return { ok: false, status: res.status };
      }

      const data = await res.json();
      console.log("AI 피드백 성공:", data);
      return { ok: true, data };

    } catch (error) {
      console.error("AI 피드백 네트워크 오류:", error);
      return { ok: false };
    }
  };

  const createOrder = async (items: { productId: number; qty: number }[]) => {
    const userIdNum = Number(currentUser.id);
    if (!Number.isFinite(userIdNum)) {
      throw new Error(`Invalid user id: ${currentUser.id}`);
    }

    const payload = {
      user_id: userIdNum,
      items,
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      try {
        const data = text ? JSON.parse(text) : null;
        if (!res.ok) {
          console.warn("createOrder backend returned non-ok:", res.status, data);
        } else {
          return data;
        }
      } catch (parseErr) {
        console.warn("createOrder: failed to parse backend response", parseErr, text);
      }
    } catch (err) {
      console.warn("createOrder: backend request failed", err);
    }

    const mockOrder = {
      id: Date.now(),
      total: items.reduce((s, it) => s + (it.qty || 1) * 1000, 0),
      status: "CREATED",
      items,
    };
    console.info("createOrder: returning mock order", mockOrder);
    return mockOrder;
  };

  const handlePlaceOrder = async (items: { productId: number; qty: number }[]) => {
    try {
      const order = await createOrder(items);
      console.log("Order created:", order);

      if (order && order.id != null) {
        await syncOrderFeedback(String(order.id));
      } else {
        console.warn("handlePlaceOrder: order has no id, skipping syncOrderFeedback", order);
      }

      if (order && order.id != null) {
        navigate(`/orders/${order.id}`);
      }
    } catch (e) {
      console.error("Order failed:", e);
    }
  };

  useEffect(() => {
    const loadRecs = async () => {
      setLoading(true);
      try {
        const seedId =
          orders && orders.length > 0 && orders[0].items && orders[0].items.length > 0
            ? orders[0].items[0].id
            : 1;
        const data = await fetchHybridRecommendations(seedId, 4);
        const products = Array.isArray(data) ? data : data?.recommendations || [];
        setRecs(products);
      } catch (error) {
        console.error("Failed to load recommendations:", error);
        setRecs([]);
      } finally {
        setLoading(false);
      }
    };
    loadRecs();
  }, [orders]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const placeTestOrderFromFirstRec = () => {
    const firstProduct = recs && recs.length > 0 ? recs[0] : null;
    const items = firstProduct ? [{ productId: firstProduct.id, qty: 1 }] : [{ productId: 1, qty: 1 }];
    handlePlaceOrder(items);
  };

  return (
    <div className="min-h-screen text-slate-200 selection:bg-cyan-500/30 relative font-sans bg-slate-950 overflow-hidden">
      <div className="fixed inset-0 bg-[url('/circuit-board.svg')] bg-center opacity-5 mix-blend-screen pointer-events-none z-0" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-14 relative z-10 space-y-12 sm:space-y-16"
      >
        <motion.header variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-start gap-4 sm:gap-6">
            <div className="relative group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.1)] group-hover:shadow-[0_0_50px_rgba(6,182,212,0.2)] transition-all duration-500">
                <span className="text-3xl sm:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-tr from-cyan-400 to-white">
                  {currentUser.name[0]}
                </span>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-slate-950 p-1 rounded-full border border-white/10">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-cyan-400 text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded-md flex items-center gap-2">
                  <UserCircle2 size={12} /> Citizen ID: {currentUser.id}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-white italic tracking-tighter uppercase leading-[0.9]">
                {currentUser.name}
              </h1>

              <p className="text-slate-500 font-mono text-[10px] sm:text-xs uppercase tracking-widest mt-2 pl-1 flex items-center gap-2">
                {currentUser.email}
              </p>
            </div>
          </div>

          <div className="flex gap-4 w-full md:w-auto justify-end">
            <button className="p-3 sm:p-4 bg-white/5 rounded-xl hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-400 transition-all border border-white/5 group">
              <Settings size={20} className="text-slate-400 group-hover:text-cyan-400 group-hover:rotate-90 transition-transform duration-500" />
            </button>
          </div>
        </motion.header>

        <motion.section variants={itemVariants} className="space-y-0 sm:space-y-0">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <Package className="text-cyan-500" size={24} />
            <h2 className="text-xl sm:text-2xl font-black uppercase italic tracking-tight text-white">
              Recent Operations
            </h2>
            <span className="ml-auto text-[10px] font-mono text-slate-500 uppercase tracking-widest hidden sm:block">
              // Transaction History
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {orders && orders.length === 0 ? (
              <div className="p-16 text-center bg-white/5 rounded-[2rem] border border-dashed border-white/10 flex flex-col items-center gap-4">
                <History className="text-slate-700" size={48} />
                <p className="text-slate-500 font-black uppercase tracking-widest text-sm">No transaction data found.</p>
              </div>
            ) : (
              orders?.map((order: any) => (
                <div
                  key={order.id}
                  className="group relative bg-white/[0.02] border border-white/5 p-5 sm:p-6 rounded-[1.5rem] hover:border-cyan-500/30 hover:bg-white/[0.04] transition-all duration-300 flex flex-col sm:flex-row justify-between sm:items-center gap-6 overflow-hidden"
                >
                  <div className="flex items-start sm:items-center gap-5 sm:gap-8 z-10">
                    <div className="p-3 sm:p-4 border border-white/10 rounded-xl group-hover:border-cyan-500/20 transition-colors">
                      <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Order ID</div>
                      <div className="font-mono text-cyan-400 font-bold text-sm sm:text-base tracking-wider">#{order.id.toString().slice(0, 8)}</div>
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-light text-cyan-500">$</span>
                        <span className="text-lg sm:text-2xl font-black text-white italic tracking-tight">{order.total.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{order.status}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => { // ✅ 여기서 'e'를 매개변수로 받도록 수정됨
                      e.preventDefault();

                      if (order && order.id) {
                        syncOrderFeedback(order.id);
                        navigate(`/orders/${order.id}`, { state: { order } });
                      } else {
                        console.error("주문 상세 보기 실패: Order ID가 없습니다.");
                      }
                    }}
                    className="
                      relative overflow-hidden rounded-xl font-bold uppercase tracking-widest transition-all duration-300
                      bg-white/5 border border-white/10 text-slate-200
                      hover:bg-cyan-500 hover:text-black hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]
                      group/btn flex items-center justify-center cursor-pointer w-full sm:w-auto px-6 py-3 text-xs z-10
                    "
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Details <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                    </span>
                  </button>

                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </div>
              ))
            )}
          </div>
        </motion.section>

        <motion.section variants={itemVariants} className="pt-8 border-t border-white/5">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl sm:text-2xl font-black uppercase italic flex items-center gap-3 tracking-tight text-white">
              <Sparkles className="text-cyan-400" fill="currentColor" size={20} /> Neural Recommendations
            </h2>
            <div className="hidden sm:block text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Activity size={12} className="animate-pulse text-emerald-500" />
              System Optimized
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {loading ? (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-[3/4] bg-white/5 rounded-[1.5rem] animate-pulse border border-white/5" />
              ))
            ) : (
              recs.map((product) => (
                <div key={product.id} className="flex flex-col gap-3 group">
                  <div className="relative h-full">
                    <ProductCard
                      product={product}
                      onOpen={(p: Product) => setSelectedProduct(p)}
                    />
                  </div>

                  {product.why && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="px-3 py-2 bg-slate-900/80 border border-cyan-500/20 rounded-lg flex items-start gap-2 backdrop-blur-md"
                    >
                      <ExternalLink size={10} className="text-cyan-500 mt-0.5 shrink-0" />
                      <p className="text-[9px] text-cyan-100 font-mono uppercase leading-tight line-clamp-2">
                        <span className="text-cyan-400 font-bold mr-1">AI_REASON:</span>
                        {product.why}
                      </p>
                    </motion.div>
                  )}
                </div>
              ))
            )}
          </div>
        </motion.section>

      </motion.div>

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
