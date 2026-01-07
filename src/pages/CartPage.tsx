
// src/pages/CartPage.tsx
// "use client";

// import { useCart } from "@/store/cartStore"; // 1. Zustand 스토어 임포트
// import { AnimatePresence, motion } from "framer-motion";
// import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// export default function CartPage() {
//   const navigate = useNavigate();
//   // 2. Zustand 스토어에서 필요한 데이터와 함수 추출
//   const { items, updateQty, removeItem } = useCart();

//   // 3. 합계 계산 (item.qty 사용)
//   const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

//   return (
//     <div className="min-h-screen bg-slate-950 py-20 px-6">
//       <div className="max-w-4xl mx-auto">
//         <div className="flex items-center gap-4 mb-12">
//           <button
//             onClick={() => navigate(-1)}
//             className="p-3 bg-white/5 rounded-full hover:bg-cyan-500/20 transition-colors text-cyan-400"
//           >
//             <ArrowLeft size={24} />
//           </button>
//           <h1 className="text-6xl font-black text-white italic tracking-tighter">MY_CART</h1>
//         </div>

//         {items.length === 0 ? (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="text-center py-20 bg-slate-900/50 rounded-[3rem] border border-dashed border-white/10"
//           >
//             <p className="text-slate-500 font-bold uppercase tracking-[0.3em]">Your system is empty</p>
//             <button
//               onClick={() => navigate('/')}
//               className="mt-6 text-cyan-400 hover:text-cyan-300 font-bold underline underline-offset-4"
//             >
//               Go to Store
//             </button>
//           </motion.div>
//         ) : (
//           <div className="space-y-6">
//             <AnimatePresence mode="popLayout">
//               {items.map((item) => (
//                 <motion.div
//                   key={item.id}
//                   layout
//                   initial={{ opacity: 0, scale: 0.9 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   exit={{ opacity: 0, x: -50 }}
//                   className="bg-slate-900 border border-white/5 p-6 rounded-[2.5rem] flex flex-col sm:flex-row items-center gap-8"
//                 >
//                   <img src={item.image} className="w-32 h-32 rounded-3xl object-cover" alt={item.title} />

//                   <div className="flex-1 text-center sm:text-left">
//                     <h3 className="text-xl font-bold text-white uppercase">{item.title}</h3>
//                     <p className="text-cyan-400 font-black text-lg mt-1">${item.price}</p>
//                   </div>

//                   {/* 수량 조절 버튼 로직 연결 */}
//                   <div className="flex items-center gap-6 bg-black/50 px-6 py-3 rounded-full border border-white/10">
//                     <button
//                       onClick={() => updateQty(item.id, -1)}
//                       className="text-white hover:text-cyan-400 transition-colors"
//                     >
//                       <Minus size={18}/>
//                     </button>
//                     <span className="font-bold text-white min-w-[20px] text-center">{item.qty}</span>
//                     <button
//                       onClick={() => updateQty(item.id, 1)}
//                       className="text-white hover:text-cyan-400 transition-colors"
//                     >
//                       <Plus size={18}/>
//                     </button>
//                   </div>

//                   {/* 아이템 삭제 버튼 로직 연결 */}
//                   <button
//                     onClick={() => removeItem(item.id)}
//                     className="p-4 text-slate-500 hover:text-red-500 transition-colors"
//                   >
//                     <Trash2 size={24} />
//                   </button>
//                 </motion.div>
//               ))}
//             </AnimatePresence>

//             {/* 결제 정보 섹션 */}
//             <motion.div
//               layout
//               className="mt-12 bg-cyan-600 p-10 rounded-[3rem] flex flex-col md:flex-row justify-between items-center gap-8 shadow-[0_20px_50px_rgba(8,145,178,0.3)]"
//             >
//               <div>
//                 <p className="text-cyan-100 text-xs font-black uppercase tracking-widest mb-1">Total System Value</p>
//                 <p className="text-5xl font-black text-white">${total.toLocaleString()}</p>
//               </div>
//               <button className="w-full md:w-auto bg-white text-cyan-600 px-12 py-5 rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-xl active:scale-95">
//                 CHECKOUT NOW
//               </button>
//             </motion.div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
// src/pages/CartPage.tsx
// // src/pages/CartPage.tsx
// "use client";

// import { useCart } from "@/store/cartStore";
// import { AnimatePresence, motion } from "framer-motion";
// import { ArrowLeft, Cpu, Minus, Plus, Sparkles, Trash2, Zap } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// export default function CartPage() {
//   const navigate = useNavigate();
//   const { items, updateQty, removeItem } = useCart();

//   // Calculations
//   const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
//   const shipping = subtotal > 500 ? 0 : 25;
//   const total = subtotal + shipping;

//   return (
//     <div className="min-h-screen text-cyan-100 selection:bg-cyan-500/30 relative overflow-hidden font-sans ">
//       {/* Cyberpunk Background with Circuit Pattern */}
//       <div className="absolute inset-0 bg-[url('/circuit-board.svg')] bg-center opacity-10 mix-blend-screen pointer-events-none" />

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">

//         {/* Header Section */}
//         {/* [변경] 모바일에서는 세로 정렬, 간격 축소 / 태블릿 이상에서 가로 정렬 및 큰 간격 */}
//         <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 mb-10 md:mb-16">
//           <div className="flex items-center gap-4 sm:gap-6">
//             <button
//               onClick={() => navigate(-1)}
//               // [변경] 모바일에서는 터치 영역 확보를 위해 약간 작게, PC에서는 넉넉하게
//               className="group relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 transition-all duration-300 cursor-pointer flex-shrink-0"
//             >
//               <ArrowLeft
//                 // [변경] 아이콘 크기 반응형 조절
//                 size={28}
//                 className="sm:w-[32px] sm:h-[32px] text-slate-600 transition-all duration-300 ease-out
//                 group-hover:text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]"
//               />
//               <div className="absolute inset-0 bg-cyan-500/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
//             </button>

//             <div className="flex flex-col">
//               <div className="flex items-center gap-2 text-cyan-400 text-[10px] sm:text-xs font-mono tracking-[0.2em] uppercase mb-1 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]">
//                 <Cpu size={14} className="animate-spin-slow" />
//                 <span>System // Cartlog.v3</span>
//               </div>

//               {/* [변경] 타이틀 폰트 크기를 모바일(4xl) -> PC(7xl)로 드라마틱하게 변화 */}
//               <h1 className="
//                 text-4xl sm:text-5xl md:text-6xl lg:text-7xl
//                 font-black
//                 italic
//                 tracking-tighter
//                 text-transparent
//                 bg-clip-text
//                 bg-gradient-to-r to-cyan-400 via-cyan-200 from-white
//                 leading-none
//                 z-50
//                 drop-shadow-[0_0_30px_rgba(6,182,212,0.4)]
//                 overflow-visible
//                 pr-[0.2em]
//                 inline-block
//               ">
//                 NEON_CART
//               </h1>
//             </div>
//           </div>
//         </header>

//         {/*  */}

//         {items.length === 0 ? (
//           <EmptyState navigate={navigate} />
//         ) : (
//           // [변경] 대형 화면(lg)에서 좌우 2단 레이아웃 전환, 간격 조정
//           <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">

//             {/* Left Column: Cart Items List */}
//             <div className="flex-1 space-y-4 sm:space-y-6 lg:space-y-8">
//               <AnimatePresence mode="popLayout">
//                 {items.map((item) => (
//                   <motion.div
//                     key={item.id}
//                     layout
//                     initial={{ opacity: 0, y: 20, scale: 0.95 }}
//                     animate={{ opacity: 1, y: 0, scale: 1 }}
//                     exit={{ opacity: 0, x: -100, scale: 0.9 }}
//                     // [변경] 패딩을 모바일에서 줄여서(p-4) 화면 효율성 증대
//                     className="group relative bg-black/40 backdrop-blur-xl border border-cyan-500/30 p-4 sm:p-6 rounded-[2rem] overflow-hidden transition-all duration-500 hover:border-cyan-400/80 hover:shadow-[inset_0_0_30px_rgba(6,182,212,0.1),0_0_25px_rgba(6,182,212,0.3)]"
//                   >
//                     <div className="absolute inset-0 bg-[linear-gradient(transparent,rgba(6,182,212,0.1),transparent)] bg-[length:100%_4px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none animate-scan" />

//                     {/* [변경] 모바일: 세로 배치(flex-col), 태블릿 이상: 가로 배치(flex-row) */}
//                     <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 relative z-10">

//                       {/* Product Image Container */}
//                       {/* [변경] 모바일: 이미지 높이를 줄이고 너비를 꽉 채움 / PC: 고정 크기 */}
//                       <div className="relative w-full h-48 sm:w-36 sm:h-36 flex-shrink-0 rounded-2xl overflow-hidden border border-cyan-500/20 group-hover:border-cyan-400/50 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]">
//                         <img
//                           src={item.image}
//                           className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-500"
//                           alt={item.title}
//                         />
//                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-50" />
//                         <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-cyan-900/50 to-transparent mix-blend-overlay" />
//                       </div>

//                       {/* Item Details & Controls */}
//                       <div className="flex-1 w-full flex flex-col justify-between min-h-[auto] sm:min-h-[144px]">
//                         <div>
//                            <div className="flex justify-between items-start mb-2">
//                              <span className="text-[10px] text-cyan-300 font-mono border border-cyan-700/50 px-2 py-1 rounded-full uppercase bg-cyan-950/30 drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]">
//                                ID: {item.id.toString().padStart(4, 'X')}
//                              </span>
//                              <button
//                                onClick={() => removeItem(item.id)}
//                                // [변경] 삭제 버튼의 터치 영역 확대 (p-3) 및 위치 조정
//                                className="text-cyan-600 hover:text-fuchsia-500 transition-colors p-3 -mr-3 -mt-3 sm:p-2 sm:-mr-2 sm:-mt-2"
//                              >
//                                <Trash2 size={20} className="drop-shadow-[0_0_8px_currentColor]" />
//                              </button>
//                            </div>

//                            {/* [변경] 텍스트 크기 반응형 조절 (모바일: lg/xl -> PC: xl/2xl) */}
//                            <h3 className="text-lg sm:text-xl font-bold text-white uppercase leading-tight mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] line-clamp-2">
//                              {item.title}
//                            </h3>
//                            <p className="text-xl sm:text-2xl font-black text-cyan-400 font-mono tracking-tight drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]">
//                              ${item.price.toLocaleString()}
//                            </p>
//                         </div>

//                         {/* Futuristic Qty Controls */}
//                         {/* [변경] 모바일: 전체 너비로 확장하여 버튼 누르기 쉽게 변경 / PC: 왼쪽 정렬 유지 */}
//                         <div className="self-center w-full sm:w-auto sm:self-start flex items-center justify-between sm:justify-start gap-2 bg-black/60 rounded-full p-1 border border-cyan-500/30 mt-4 shadow-[0_0_15px_rgba(0,0,0,0.3)] backdrop-blur-md">
//                           <button
//                             onClick={() => updateQty(item.id, -1)}
//                             // [변경] 버튼 크기 통일 및 호버 효과 유지
//                             className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-cyan-950/50 hover:bg-cyan-500 text-cyan-400 hover:text-black transition-all border border-cyan-500/20 hover:border-cyan-300 hover:shadow-[0_0_15px_rgba(6,182,212,0.5)]"
//                           >
//                             <Minus size={16} />
//                           </button>

//                           {/* [변경] 수량 표시 영역을 늘려 터치 실수 방지 */}
//                           <span className="font-mono font-bold text-white flex-1 sm:flex-none sm:w-10 text-center text-lg drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
//                             {item.qty}
//                           </span>

//                           <button
//                             onClick={() => updateQty(item.id, 1)}
//                             className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-cyan-950/50 hover:bg-cyan-500 text-cyan-400 hover:text-black transition-all border border-cyan-500/20 hover:border-cyan-300 hover:shadow-[0_0_15px_rgba(6,182,212,0.5)]"
//                           >
//                             <Plus size={16} />
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   </motion.div>
//                 ))}
//               </AnimatePresence>
//             </div>

//             {/* Right Column: Neon Summary Panel */}
//             {/* [변경] 너비 유동성 확보 (w-full -> lg:w-[400px]) */}
//             <div className="w-full lg:w-[400px] flex-shrink-0 lg:sticky lg:top-10 h-fit mt-4 lg:mt-0">
//               <motion.div
//                 initial={{ opacity: 0, x: 20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 // [변경] 모바일 내부 여백 축소 (p-6) -> PC 확대 (p-8)
//                 className="bg-black/40 backdrop-blur-xl border-2 border-double border-cyan-500/40 p-6 sm:p-8 rounded-[2.5rem] shadow-[0_0_40px_rgba(6,182,212,0.15),inset_0_0_20px_rgba(6,182,212,0.05)] relative overflow-hidden"
//               >
//                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-70" />
//                 <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent opacity-70" />

//                 <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-fuchsia-300 uppercase mb-6 sm:mb-8 flex items-center gap-3 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
//                   <Zap size={24} className="text-cyan-400 fill-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
//                   Power Summary
//                 </h2>

//                 <div className="space-y-4 sm:space-y-5 mb-8 sm:mb-10 font-mono text-xs sm:text-sm">
//                   <div className="flex justify-between text-cyan-200/70">
//                     <span>Subtotal_Value:</span>
//                     <span className="font-bold text-cyan-100 drop-shadow-[0_0_5px_rgba(6,182,212,0.3)]">${subtotal.toLocaleString()}</span>
//                   </div>
//                   <div className="flex justify-between text-cyan-200/70">
//                     <span>Quantum_Shipping:</span>
//                     <span className="font-bold text-cyan-100">
//                       {shipping === 0 ? <span className="text-fuchsia-400 drop-shadow-[0_0_5px_rgba(232,121,249,0.5)]">FREE_LINK</span> : `$${shipping}`}
//                     </span>
//                   </div>
//                   <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent my-6" />
//                   <div className="flex justify-between items-end">
//                     <span className="text-white font-bold uppercase tracking-wider text-sm sm:text-base">Total_Core</span>
//                     {/* [변경] 가격 폰트 크기 반응형 조절 (3xl -> 5xl) */}
//                     <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-cyan-200 to-fuchsia-400 font-mono tracking-tighter drop-shadow-[0_0_20px_rgba(6,182,212,0.8)]">
//                       ${total.toLocaleString()}
//                     </span>
//                   </div>
//                 </div>

//                 <button
//                   onClick={() => navigate('/checkout')}
//                   className="w-full group relative overflow-hidden bg-gradient-to-r from-cyan-600 to-fuchsia-600 p-1 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_50px_rgba(232,121,249,0.6)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
//                 >
//                   <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity" />
//                   {/* [변경] 버튼 내부 패딩 조절 (모바일 py-4 -> PC py-5) */}
//                   <div className="relative h-full bg-black/80 backdrop-blur-sm rounded-xl px-4 py-4 sm:px-8 sm:py-5 flex items-center justify-center gap-2 sm:gap-3 group-hover:bg-black/60 transition-colors">
//                     <span className="font-black text-sm sm:text-xl text-white tracking-widest group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-300 group-hover:to-fuchsia-300 transition-all">
//                       INITIATE CHECKOUT
//                     </span>
//                     <Sparkles size={20} className="text-cyan-300 animate-pulse group-hover:text-fuchsia-300" />
//                   </div>
//                 </button>
//               </motion.div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// function EmptyState({ navigate }: { navigate: (path: string) => void }) {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 10 }}
//       animate={{ opacity: 1, y: 0 }}
//       className="flex flex-col items-center justify-center py-20 sm:py-32 backdrop-blur-sm"
//     >
//       <div className="
//         group relative flex items-center justify-center
//         w-16 h-16 mb-6 sm:mb-8
//         rounded-full border border-cyan-500/40 bg-cyan-950/30 backdrop-blur-md
//         shadow-[0_0_20px_rgba(6,182,212,0.3)]
//         transition-all duration-300
//         hover:border-cyan-400/80
//         hover:shadow-[0_0_35px_rgba(6,182,212,0.5)]
//       ">
//         <div className="absolute top-2 right-2 w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
//         <Cpu
//           size={30}
//           className="relative z-10 text-cyan-400 transition-all duration-300
//                    group-hover:text-cyan-200 group-hover:drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]"
//         />
//         <div className="absolute inset-0 rounded-full border border-dashed border-cyan-500/20 animate-[spin_10s_linear_infinite] group-hover:border-cyan-500/40" />
//       </div>

//       <h2 className="text-xl sm:text-2xl font-black text-white mb-2 tracking-[0.2em] uppercase italic text-center">
//         System Idle
//       </h2>
//       <p className="text-slate-500 mb-8 sm:mb-10 font-mono text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-center px-4">
//         No active data stream detected in cart.
//       </p>

//       <motion.button
//         whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(6,182,212,0.6)" }}
//         whileTap={{ scale: 0.95 }}
//         onClick={() => navigate('/')}
//         // [변경] 버튼의 패딩과 너비를 모바일/PC에 맞춰 조절
//         className="
//           group relative cursor-pointer z-10 rounded-full overflow-hidden transition-all border-2 border-transparent
//           px-8 py-4 w-[80%] sm:w-auto md:px-14 md:py-7
//           bg-white text-black font-black text-[10px] tracking-[0.3em] uppercase
//           shadow-[0_0_25px_rgba(255,255,255,0.3)]
//           hover:border-cyan-400
//         "
//       >
//         <span className="relative z-10 flex items-center justify-center gap-3 md:gap-4 transition-colors duration-300">
//           Access Store Grid
//         </span>
//         <div className="absolute inset-0 bg-cyan-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
//       </motion.button>
//     </motion.div>
//   );
// }
// src/pages/CartPage.tsx
"use client";

import { useCart } from "@/store/cartStore";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Cpu, LayoutGrid, Minus, Plus, ShieldCheck, Trash2, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CartPage() {
  const navigate = useNavigate();
  const { items, updateQty, removeItem } = useCart();

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = subtotal > 500 ? 0 : 25;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen text-slate-200 selection:bg-cyan-500/30 relative font-sans bg-slate-950">
      {/* Background */}
      <div className="fixed inset-0 bg-[url('/circuit-board.svg')] bg-center opacity-5 mix-blend-screen pointer-events-none" />

      {/* Main Container: Mobile(px-4) -> Tablet(px-6) -> PC(px-8) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-14 relative z-10">

        {/* HEADER SECTION */}
        {/* Layout: Mobile(Col) -> Tablet/PC(Row) */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-12 lg:mb-16">
          <div className="flex items-start gap-4 sm:gap-6">

            {/* Back Button: Mobile(w-10) -> Tablet/PC(w-12) */}
            <button
              onClick={() => navigate(-1)}
              className="group relative flex items-center justify-center
                         w-10 h-10 sm:w-12 sm:h-12
                         transition-all duration-300 cursor-pointer flex-shrink-0
                         border border-white/10 rounded-full hover:bg-cyan-500/20 hover:border-cyan-500/30"
            >
              <ArrowLeft
                className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400 group-hover:text-cyan-300 transition-colors"
              />
            </button>

            <div className="flex flex-col">
              {/* Badge Area */}
              <div className="flex items-center gap-3 mb-2 sm:mb-3">
                <span className="text-cyan-400 text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase px-2 sm:px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-md flex items-center gap-2">
                  <Cpu className="w-3 h-3 sm:w-4 sm:h-4" /> System // Cartlog.v3
                </span>
              </div>

              {/* Title: Mobile(3xl) -> Tablet(5xl) -> PC(7xl) */}
              <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-white italic tracking-tighter uppercase leading-[0.9]">
                Command Center
              </h1>

              {/* Subtitle */}
              <p className="text-cyan-500/60 font-mono text-[10px] sm:text-sm uppercase tracking-tighter mt-2 pl-1">
                Active Modules: {items.length} Units
              </p>
            </div>
          </div>
        </header>

        {items.length === 0 ? (
          <EmptyState navigate={navigate} />
        ) : (
          /* Grid Layout: Mobile(Col) -> PC(Row split) */
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">

            {/* LEFT COLUMN: Cart Items List */}
            <div className="flex-1 w-full space-y-4">
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="group relative bg-white/[0.02] border border-white/5 p-4 sm:p-6 rounded-3xl overflow-hidden transition-all duration-300 hover:border-cyan-500/30 hover:bg-white/[0.04]"
                  >
                    <div className="flex flex-col sm:flex-row gap-5 sm:gap-6">

                      {/* Product Image: Mobile(Full Width) -> Tablet(Fixed Width) */}
                      <div className="relative w-full sm:w-32 lg:w-40 aspect-square flex-shrink-0 rounded-2xl overflow-hidden bg-slate-900 border border-white/5 group-hover:border-cyan-500/20 transition-colors">
                         <img
                          src={item.image}
                          className="w-full h-full object-cover p-2 mix-blend-overlay opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                          alt={item.title}
                        />
                         <img
                          src={item.image}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          alt={item.title}
                        />
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 flex flex-col justify-between min-h-[auto] sm:min-h-[128px]">
                        <div>
                          <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic mb-1">
                                  ID: {item.id.toString().padStart(4, '0')}
                                </span>
                                {/* Item Title: Responsive Text */}
                                <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-white uppercase italic tracking-tighter leading-tight mb-2 pr-8">
                                  {item.title}
                                </h3>
                            </div>
                             <button
                              onClick={() => removeItem(item.id)}
                              className="text-slate-600 hover:text-red-400 transition-colors p-2 -mr-2 -mt-2"
                              title="Remove Module"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>

                          <div className="flex items-baseline gap-1 text-2xl font-black text-white">
                            <span className="text-sm font-light text-cyan-500">$</span>
                            {item.price.toLocaleString()}
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-6 mt-4 pt-4 border-t border-white/5">
                           <div className="flex items-center gap-3 bg-slate-950/50 rounded-xl p-1 border border-white/10">
                              <button
                                onClick={() => updateQty(item.id, -1)}
                                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                              >
                                <Minus size={14} />
                              </button>

                              <span className="font-mono font-bold text-white w-6 text-center text-sm">
                                {item.qty}
                              </span>

                              <button
                                onClick={() => updateQty(item.id, 1)}
                                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg hover:bg-white/10 text-cyan-400 transition-all drop-shadow-[0_0_8px_rgba(6,182,212,0.6)] hover:drop-shadow-[0_0_12px_rgba(34,211,238,1)]"
                              >
                                <Plus size={14} />
                              </button>
                           </div>
                           <div className="text-[10px] font-mono text-cyan-500/70 uppercase tracking-widest hidden sm:block">
                              STATUS: ACTIVE
                           </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* RIGHT COLUMN: Summary Panel */}
            {/* Width: Mobile(Full) -> PC(Fixed 400px) */}
            <div className="w-full lg:w-[400px] flex-shrink-0 lg:sticky lg:top-10">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-400/80 rounded-[2rem] shadow-[0_0_50px_rgba(6,182,212,0.1)] p-6 sm:p-8 relative overflow-hidden"
              >
                {/* Decorative header line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-50" />

                <h2 className="text-lg sm:text-xl font-black text-white uppercase italic tracking-tighter mb-6 sm:mb-8 flex items-center gap-2">
                  <Zap size={20} className="text-cyan-500 fill-cyan-500" />
                  Order Summary
                </h2>

                {/* Specs/Cost Grid */}
                <div className="space-y-4 mb-8">
                  <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex justify-between items-center">
                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Subtotal</span>
                    <span className="text-sm text-cyan-100 font-bold font-mono">${subtotal.toLocaleString()}</span>
                  </div>

                  <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex justify-between items-center">
                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Quantum Ship</span>
                    <span className="text-sm font-bold font-mono">
                      {shipping === 0 ? <span className="text-emerald-400">FREE</span> : `$${shipping}`}
                    </span>
                  </div>

                  <div className="py-4 border-t border-white/10 mt-2 flex justify-between items-end">
                     <span className="text-xs text-white uppercase font-black tracking-[0.2em]">Total Core</span>
                     <div className="flex items-baseline gap-1 text-2xl sm:text-3xl font-black text-white">
                        <span className="text-lg font-light text-cyan-500">$</span>
                        {total.toLocaleString()}
                     </div>
                  </div>
                </div>

                <motion.button
  whileHover={{ scale: 1.02 }}

  onClick={() => navigate('/checkout')}
  className="
    group relative inline-flex items-center justify-center
    overflow-hidden rounded-full p-[1px]
    focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:ring-offset-2 focus:ring-offset-slate-950

    /* 반응형 크기 설정: 모바일은 꽉 차게(w-full), 태블릿/PC는 적당한 너비 */
    w-full sm:w-auto sm:min-w-[240px] md:min-w-[300px]
  "
>
  {/* 1. 배경 애니메이션 그라디언트 (회전하는 빛 효과) */}
  {/* Cyan(하늘색) <-> Blue(진한 파랑) 순환 */}
  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-600 to-cyan-400 animate-[shimmer_2s_linear_infinite] bg-[length:200%_100%]" />

  {/* 2. 내부 컨텐츠 영역 */}
  <div className="
    relative w-full h-full
    bg-slate-950
    /* 호버 시 배경 투명도 조절로 뒤쪽 빛이 비치게 함 */
    group-hover:bg-cyan-950/30
    transition-colors duration-300
    rounded-full

    /* 패딩 및 레이아웃 */
    px-6 py-4 md:px-10 md:py-6
    flex items-center justify-center gap-3
    backdrop-blur-sm
  ">

    {/* 아이콘: 보안/결제 의미 */}
    <ShieldCheck
      size={20}
      className="text-cyan-500 group-hover:text-white transition-colors duration-300"
    />

    {/* 텍스트 */}
    <span className="
      font-black uppercase tracking-[0.2em] text-white
      text-xs md:text-sm
      whitespace-nowrap
      group-hover:text-cyan-50 transition-colors
      group-hover:drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]
    ">
      Initiate Checkout
    </span>


  </div>

  {/* 3. 호버 시 글로우(Glow) 효과 */}
  <div className="absolute inset-0 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.0)] group-hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-shadow duration-300 pointer-events-none" />

</motion.button>
              </motion.div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ navigate }: { navigate: (path: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 sm:py-32 backdrop-blur-sm px-4"
    >
      <div className="
        group relative flex items-center justify-center
        w-16 h-16 mb-6 sm:mb-8
        rounded-full border border-cyan-500/40 bg-cyan-950/30 backdrop-blur-md
        shadow-[0_0_20px_rgba(6,182,212,0.3)]
        transition-all duration-300
        hover:border-cyan-400/80
        hover:shadow-[0_0_35px_rgba(6,182,212,0.5)]
      ">
        <div className="absolute top-2 right-2 w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
        <Cpu
          size={30}
          className="relative z-10 text-cyan-400 transition-all duration-300
                   group-hover:text-cyan-200 group-hover:drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]"
        />
        <div className="absolute inset-0 rounded-full border border-dashed border-cyan-500/20 animate-[spin_10s_linear_infinite] group-hover:border-cyan-500/40" />
      </div>

      <h2 className="text-xl sm:text-2xl font-black text-white mb-2 tracking-[0.2em] uppercase italic text-center">
        System Idle
      </h2>
      <p className="text-slate-500 mb-8 sm:mb-10 font-mono text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-center px-4 max-w-md">
        No active data stream detected in cart.
      </p>

<motion.button
  whileHover={{ scale: 1.02 }}

  onClick={() => navigate('/')}
  className="
    group relative inline-flex items-center justify-center
    overflow-hidden rounded-full p-[1px]
    focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:ring-offset-2 focus:ring-offset-slate-950

    /* 반응형 크기 설정 */
    w-full sm:w-auto min-w-[200px] md:min-w-[260px]
  "
>
  {/* 1. 배경 애니메이션 그라디언트 (회전하는 빛 효과) */}
  {/* Cyan(하늘색) -> Blue(파란색) -> Cyan 순환 */}
  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-cyan-500/40 to-cyan-400 animate-[shimmer_2s_linear_infinite] bg-[length:200%_100%]" />

  {/* 2. 내부 컨텐츠 영역 (검은 배경으로 가운데를 가림) */}
  <div className="
    relative w-full h-full
    bg-slate-950  group-hover:bg-cyan-950/30 transition-colors duration-300
    rounded-full

    /* 패딩 및 레이아웃 */
    px-6 py-4 md:px-10 md:py-6
    flex items-center justify-center gap-3 md:gap-4
    backdrop-blur-sm
  ">

    {/* 아이콘: Store Grid의 의미를 담은 아이콘 */}
    <LayoutGrid
      size={18}
      className="text-cyan-500 group-hover:text-white transition-colors duration-300"
    />

    {/* 텍스트 */}
    <span className="
      font-black uppercase tracking-[0.2em] text-white
      text-[10px] sm:text-xs md:text-sm
      whitespace-nowrap
      group-hover:text-cyan-50 transition-colors
      group-hover:drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]
    ">
      Access Store Grid
    </span>


  </div>

  {/* 3. 호버 시 글로우(Glow) 효과 */}
  <div className="absolute inset-0 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.0)] group-hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-shadow duration-300 pointer-events-none" />

</motion.button>
    </motion.div>
  );
}
