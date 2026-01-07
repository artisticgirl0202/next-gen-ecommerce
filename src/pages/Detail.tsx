// src/pages/Detail.tsx
// import { useCart } from "@/store/cartStore";
// import { AnimatePresence, motion } from "framer-motion";
// import { CheckCircle, ShoppingCart } from "lucide-react";
// import { useLocation } from "react-router-dom";

// export default function Detail({ onAdd, addedFeedback }: { onAdd: any, addedFeedback: boolean }) {
//   const location = useLocation();
//   const product = location.state?.product;
//   const { items } = useCart();
// const currentQty = useCart((state) =>
//     state.items.find((item) => item.id === product?.id)?.qty || 0
//   );

//   const isInCart = currentQty > 0;
//   if (!product) return <div className="text-white">Product not found.</div>;

//   // 장바구니에 이미 있는지 확인 및 수량 가져오기
//   const cartItem = items.find((item) => item.id === product.id);
//   const isInCart = !!cartItem;

//   return (
//     <div className="flex flex-col md:flex-row gap-12 text-white mt-10">
//       {/* 왼쪽: 상품 이미지 */}
//       <div className="flex-1">
//         <motion.img
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           src={product.image}
//           alt={product.title}
//           className="w-full rounded-3xl border border-white/10 shadow-2xl"
//         />
//       </div>

//       {/* 오른쪽: 상품 정보 */}
//       <div className="flex-1 flex flex-col justify-center">
//         <h2 className="text-4xl font-bold mb-4">{product.title}</h2>
//         <p className="text-slate-400 mb-8 text-lg leading-relaxed">{product.description}</p>

//         <div className="flex items-center gap-6 mb-10">
//       <span className="text-5xl font-black text-cyan-400">${product.price}</span>
//       {isInCart && (
//         <motion.span
//           initial={{ opacity: 0, x: -10 }}
//           animate={{ opacity: 1, x: 0 }}
//           key={`detail-qty-${currentQty}`} // 수량 변경 시 깜빡이는 효과
//           className="bg-cyan-500/10 text-cyan-500 px-3 py-1 rounded-full text-sm font-bold border border-cyan-500/20"
//         >
//           arleady {currentQty} added to cart!
//         </motion.span>
//       )}
//     </div>

//         <button
//           onClick={() => onAdd(product)}
//           className={`relative h-16 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 overflow-hidden
//             ${addedFeedback
//               ? "bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]"
//               : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)]"
//             }`}
//         >
//           <AnimatePresence mode="wait">
//             {addedFeedback ? (
//               <motion.div
//                 key="added"
//                 initial={{ y: 20, opacity: 0 }}
//                 animate={{ y: 0, opacity: 1 }}
//                 exit={{ y: -20, opacity: 0 }}
//                 className="flex items-center gap-2"
//               >
//                 <CheckCircle size={24} />
//                 <span>장바구니 추가됨! (+1)</span>
//               </motion.div>
//             ) : (
//               <motion.div
//                 key="default"
//                 initial={{ y: 20, opacity: 0 }}
//                 animate={{ y: 0, opacity: 1 }}
//                 exit={{ y: -20, opacity: 0 }}
//                 className="flex items-center gap-2"
//               >
//                 <ShoppingCart size={24} />
//                 <span>{isInCart ? "하나 더 추가하기" : "Add to Cart"}</span>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </button>
//       </div>
//     </div>
//   );
// }
"use client";

import { useCart } from "@/store/cartStore"; // ⭐ Zustand 스토어 구독
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, CheckCircle, ShoppingCart } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Detail({ onAdd, addedFeedback }: { onAdd: any, addedFeedback: boolean }) {
  const location = useLocation();
  const navigate = useNavigate();
  const product = location.state?.product;

  // 💡 수정: 스토어의 items 배열 자체를 감시하여 해당 id가 있는지 찾습니다.
const currentQty = useCart((state) =>
    state.items.find((item) => item.id === product?.id)?.qty || 0
  );
  const isInCart = currentQty > 0;

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <p>Product not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* 뒤로가기 버튼 */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors mb-10 group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        BACK TO SYSTEM
      </button>

      <div className="flex flex-col md:flex-row gap-16 text-white">
        {/* 왼쪽: 상품 이미지 섹션 */}
        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-cyan-500/10 blur-3xl rounded-full opacity-50" />
            <img
              src={product.image}
              alt={product.title}
              className="relative w-full rounded-[3rem] border border-white/10 shadow-2xl object-cover"
            />
          </motion.div>
        </div>

        {/* 오른쪽: 상품 정보 및 컨트롤 섹션 */}
        <div className="flex-1 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <span className="text-cyan-500 font-black tracking-[0.3em] uppercase text-sm mb-4 block">
              Hardware Component
            </span>
            <h2 className="text-5xl font-black mb-6 italic tracking-tighter">{product.title}</h2>
            <p className="text-slate-400 mb-10 text-lg leading-relaxed">{product.description}</p>

            <div className="flex items-center gap-6 mb-12">
              <span className="text-6xl font-black text-white">${product.price}</span>

              {/* ⭐ 실시간 수량 배지: currentQty가 변할 때마다 즉시 반응 */}
              <AnimatePresence>
                {isInCart && (
                  <motion.span
                    key={currentQty} // 숫자가 바뀔 때마다 통통 튀는 애니메이션 트리거
                    initial={{ scale: 0.5, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    className="bg-cyan-500/10 text-cyan-400 px-4 py-2 rounded-full text-sm font-black border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.1)]"
                  >
                    IN_SYSTEM: {currentQty} UNITS
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            {/* 구매 버튼 */}
            <button
              onClick={() => onAdd(product)}
              disabled={addedFeedback}
              className={`relative w-full h-20 rounded-3xl font-black text-xl transition-all flex items-center justify-center gap-4 overflow-hidden
                ${addedFeedback
                  ? "bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                  : "bg-white text-black hover:bg-cyan-400 hover:scale-[1.02] active:scale-[0.98]"
                }`}
            >
              <AnimatePresence mode="wait">
                {addedFeedback ? (
                  <motion.div
                    key="added"
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -30, opacity: 0 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle size={28} />
                    <span>ADDED TO CART</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="default"
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -30, opacity: 0 }}
                    className="flex items-center gap-3"
                  >
                    <ShoppingCart size={28} />
                    {/* ⭐ 버튼 텍스트도 실시간 수량에 따라 동적으로 변경 */}
                    <span>
  {addedFeedback
    ? "SUCCESSFULLY ADDED!" // 담기 성공 시 잠깐 보여줄 메시지
    : isInCart
      ? `ALREADY IN SYSTEM: ${currentQty} UNITS` // 이미 담겨있을 때의 메시지
      : "INITIALIZE PURCHASE" // 처음 담을 때의 메시지
  }
</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
