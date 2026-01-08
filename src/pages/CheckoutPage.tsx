// "use client";

// import { useCart } from "@/store/cartStore";
// import { ArrowLeft, CreditCard, Lock, MapPin, ShieldCheck } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// export default function CheckoutPage() {
//   const navigate = useNavigate();
//   const { items, total } = useCart();

//   const subtotal = items.reduce((acc, item) => acc + item.price * item.qty, 0);
//   const tax = subtotal * 0.1;
//   const finalTotal = subtotal + tax;

//   const handleFinalPayment = () => {
//     alert("신경망 암호화 결제가 완료되었습니다. 주문 번호: #NEURAL-2025-001");
//     // 여기에 장바구니 비우기 로직 추가 가능
//     navigate("/");
//   };

//   return (
//     <div className="min-h-screen bg-slate-950 text-white py-20 px-6">
//       <div className="max-w-6xl mx-auto">
//         <div className="flex items-center gap-4 mb-12">
//           <button onClick={() => navigate(-1)} className="p-3 bg-white/5 rounded-full hover:bg-cyan-500/20 text-cyan-400">
//             <ArrowLeft size={24} />
//           </button>
//           <h1 className="text-4xl font-black italic tracking-tighter uppercase">Order_Checkout</h1>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
//           {/* 왼쪽: 배송 및 결제 정보 입력 (8컬럼) */}
//           <div className="lg:col-span-8 space-y-8">
//             {/* 1. 배송지 정보 */}
//             <section className="bg-slate-900/40 border border-white/5 p-8 rounded-[2.5rem]">
//               <div className="flex items-center gap-3 mb-6">
//                 <MapPin className="text-cyan-400" />
//                 <h2 className="text-xl font-bold uppercase tracking-tight">Delivery_Address</h2>
//               </div>
//               <div className="grid grid-cols-2 gap-4">
//                 <input type="text" placeholder="First Name" className="bg-black/40 border border-white/10 p-4 rounded-xl focus:border-cyan-500 outline-none" />
//                 <input type="text" placeholder="Last Name" className="bg-black/40 border border-white/10 p-4 rounded-xl focus:border-cyan-500 outline-none" />
//                 <input type="text" placeholder="Street Address" className="col-span-2 bg-black/40 border border-white/10 p-4 rounded-xl focus:border-cyan-500 outline-none" />
//                 <input type="text" placeholder="City" className="bg-black/40 border border-white/10 p-4 rounded-xl focus:border-cyan-500 outline-none" />
//                 <input type="text" placeholder="Zip Code" className="bg-black/40 border border-white/10 p-4 rounded-xl focus:border-cyan-500 outline-none" />
//               </div>
//             </section>

//             {/* 2. 결제 수단 */}
//             <section className="bg-slate-900/40 border border-white/5 p-8 rounded-[2.5rem]">
//               <div className="flex items-center gap-3 mb-6">
//                 <CreditCard className="text-cyan-400" />
//                 <h2 className="text-xl font-bold uppercase tracking-tight">Payment_Method</h2>
//               </div>
//               <div className="space-y-4">
//                 <div className="p-4 bg-cyan-500/10 border border-cyan-500/50 rounded-2xl flex items-center justify-between">
//                   <div className="flex items-center gap-3">
//                     <div className="w-10 h-6 bg-white/20 rounded-md" />
//                     <span className="font-bold">Neural Credit Card (**** 9872)</span>
//                   </div>
//                   <div className="w-5 h-5 rounded-full bg-cyan-500 border-4 border-slate-900" />
//                 </div>
//                 <div className="p-4 bg-black/20 border border-white/5 rounded-2xl flex items-center justify-between opacity-50">
//                   <span className="font-bold">Quantum Pay (Inactive)</span>
//                   <div className="w-5 h-5 rounded-full border-2 border-white/20" />
//                 </div>
//               </div>
//             </section>
//           </div>

//           {/* 오른쪽: 최종 주문 내역 요약 (4컬럼) */}
//           <div className="lg:col-span-4">
//             <div className="sticky top-24 bg-slate-900 border border-cyan-500/20 p-8 rounded-[3rem] shadow-[0_0_50px_rgba(6,182,212,0.1)]">
//               <h2 className="text-xl font-black italic mb-6">ORDER_REVIEW</h2>

//               {/* 상품 미니 리스트 */}
//               <div className="max-h-60 overflow-y-auto space-y-4 mb-8 pr-2 custom-scrollbar">
//                 {items.map((item) => (
//                   <div key={item.id} className="flex gap-4 items-center bg-black/20 p-3 rounded-2xl border border-white/5">
//                     <img src={item.image} className="w-12 h-12 rounded-xl object-cover" />
//                     <div className="flex-1">
//                       <p className="text-xs font-bold uppercase truncate">{item.name}</p>
//                       <p className="text-[10px] text-cyan-400 font-black">Qty: {item.qty} × ${item.price.toLocaleString()}</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* 금액 합계 */}
//               <div className="space-y-3 border-t border-white/5 pt-6 mb-8 text-sm font-bold">
//                 <div className="flex justify-between text-slate-400">
//                   <span>Subtotal</span>
//                   <span>${subtotal.toLocaleString()}</span>
//                 </div>
//                 <div className="flex justify-between text-slate-400">
//                   <span>Shipping</span>
//                   <span className="text-cyan-500">FREE</span>
//                 </div>
//                 <div className="flex justify-between text-slate-400">
//                   <span>System Tax (10%)</span>
//                   <span>${tax.toLocaleString()}</span>
//                 </div>
//                 <div className="flex justify-between text-2xl font-black text-white pt-4 border-t border-white/10">
//                   <span>TOTAL</span>
//                   <span className="text-cyan-400">${finalTotal.toLocaleString()}</span>
//                 </div>
//               </div>

//               <button
//                 onClick={handleFinalPayment}
//                 className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 active:scale-95 group"
//               >
//                 <Lock size={18} className="group-hover:animate-pulse" />
//                 결제 완료하기
//               </button>

//               <div className="mt-6 space-y-3">
//                 <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase">
//                   <ShieldCheck size={14} className="text-green-500" />
//                   <span>Verified Secure Checkout</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
// import { useCart } from "@/store/cartStore";
// import { useUserStore } from "@/store/userStore";
// import { CreditCard, Lock, User } from "lucide-react";
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// export default function CheckoutPage() {
//   const navigate = useNavigate();
//   const { items, removeItem } = useCart();
//   const { addOrder, profile } = useUserStore();
//   const [selectedIds, setSelectedIds] = useState<number[]>(items.map(i => i.id));

//   // 결제 완료 처리
//   const handleFinalPayment = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (selectedIds.length === 0) return alert("Select items to buy.");

//     const selectedItems = items.filter(item => selectedIds.includes(item.id));
//     const subtotal = selectedItems.reduce((acc, item) => acc + item.price * item.qty, 0);

//     const newOrder = {
//       id: `ORD-${Math.random().toString(36).toUpperCase().substring(2, 9)}`,
//       date: new Date().toLocaleDateString(),
//       items: selectedItems,
//       total: subtotal + (subtotal * 0.1),
//       status: 'Processing' as const,
//     };

//     // 1. 주문 내역에 추가
//     addOrder(newOrder);
//     // 2. 장바구니에서 결제한 상품만 삭제
//     selectedIds.forEach(id => removeItem(id));
//     // 3. 완료 페이지 이동
//     navigate("/payment-success", { state: newOrder });
//   };

//   return (
//     <div className="min-h-screen bg-slate-950 text-white py-20 px-6">
//       <form onSubmit={handleFinalPayment} className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">

//         {/* 결제 정보 입력란 */}
//         <div className="lg:col-span-7 space-y-6">
//           <h1 className="text-4xl font-black italic uppercase mb-8">Secure Checkout</h1>

//           <div className="bg-slate-900/50 border border-white/5 p-8 rounded-[2rem] space-y-4">
//             <h2 className="text-cyan-400 font-bold uppercase text-xs flex items-center gap-2"><User size={14}/> Shipping Information</h2>
//             <div className="grid grid-cols-2 gap-4">
//               <input required placeholder="FULL NAME" defaultValue={profile.name} className="bg-black/40 border border-white/10 p-4 rounded-xl outline-none focus:border-cyan-500" />
//               <input required placeholder="PHONE" defaultValue={profile.phone} className="bg-black/40 border border-white/10 p-4 rounded-xl outline-none focus:border-cyan-500" />
//               <select className="col-span-2 bg-black/40 border border-white/10 p-4 rounded-xl outline-none text-slate-400">
//                 {profile.addresses.map(addr => <option key={addr}>{addr}</option>)}
//               </select>
//             </div>
//           </div>

//           <div className="bg-slate-900/50 border border-white/5 p-8 rounded-[2rem] space-y-4">
//             <h2 className="text-cyan-400 font-bold uppercase text-xs flex items-center gap-2"><CreditCard size={14}/> Payment Details</h2>
//             <input required placeholder="CARD NUMBER (0000 0000 0000 0000)" className="w-full bg-black/40 border border-white/10 p-4 rounded-xl outline-none focus:border-cyan-500" />
//             <div className="grid grid-cols-2 gap-4">
//               <input required placeholder="EXP DATE (MM/YY)" className="bg-black/40 border border-white/10 p-4 rounded-xl outline-none focus:border-cyan-500" />
//               <input required placeholder="CVC" className="bg-black/40 border border-white/10 p-4 rounded-xl outline-none focus:border-cyan-500" />
//             </div>
//           </div>
//         </div>

//         {/* 선택 상품 확인란 */}
//         <div className="lg:col-span-5">
//           <div className="bg-slate-900 border border-white/10 p-8 rounded-[2.5rem] sticky top-24">
//             <h2 className="text-xl font-black italic mb-6 uppercase">Order Review</h2>
//             <div className="space-y-3 mb-8">
//               {items.map(item => (
//                 <div key={item.id} onClick={() => setSelectedIds(prev => prev.includes(item.id) ? prev.filter(i => i !== item.id) : [...prev, item.id])}
//                      className={`flex items-center gap-3 p-2 rounded-xl border transition-all cursor-pointer ${selectedIds.includes(item.id) ? "border-cyan-500/50 bg-white/5" : "border-transparent opacity-40"}`}>
//                   <div className={`w-4 h-4 rounded border ${selectedIds.includes(item.id) ? "bg-cyan-500" : ""}`} />
//                   <img src={item.image} className="w-10 h-10 rounded-lg object-cover" />
//                   <span className="flex-1 text-xs font-bold truncate uppercase">{item.name}</span>
//                   <span className="text-xs font-black">${item.price}</span>
//                 </div>
//               ))}
//             </div>
//             <button type="submit" className="w-full bg-cyan-600 text-white py-5 rounded-2xl font-black hover:bg-cyan-500 transition-all flex items-center justify-center gap-3">
//               <Lock size={18}/> COMPLETE PURCHASE
//             </button>
//           </div>
//         </div>
//       </form>
//     </div>
//   );
// }
// src/pages/CheckoutPage.tsx
// "use client";

// import { useCart } from "@/store/cartStore";
// import { useUserStore } from "@/store/userStore";
// import { motion } from "framer-motion";
// import {
//   ArrowLeft,
//   CheckCircle2,
//   Cpu,
//   CreditCard,
//   Lock,
//   ScanLine,
//   ShieldCheck,
//   User
// } from "lucide-react";
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// export default function CheckoutPage() {
//   const navigate = useNavigate();
//   const { items, removeItem } = useCart();
//   const { addOrder, profile } = useUserStore();

//   // 초기에는 모든 아이템 선택
//   const [selectedIds, setSelectedIds] = useState<number[]>(items.map(i => i.id));

//   // 계산 로직
//   const selectedItems = items.filter(item => selectedIds.includes(item.id));
//   const subtotal = selectedItems.reduce((acc, item) => acc + item.price * item.qty, 0);
//   const tax = subtotal * 0.1;
//   const total = subtotal + tax;

//   const handleFinalPayment = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (selectedIds.length === 0) return alert("Select items to buy.");

//     const newOrder = {
//       id: `ORD-${Math.random().toString(36).toUpperCase().substring(2, 9)}`,
//       date: new Date().toLocaleDateString(),
//       items: selectedItems,
//       total: total,
//       status: 'Processing' as const,
//     };

//     addOrder(newOrder);
//     selectedIds.forEach(id => removeItem(id));
//     navigate("/payment-success", { state: newOrder });
//   };

//   // 공통 Input 스타일
//   const inputClass = "w-full bg-black/50 border border-cyan-500/30 rounded-xl px-4 py-4 text-cyan-100 placeholder:text-slate-600 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(6,182,212,0.3)] focus:bg-cyan-950/20 outline-none transition-all font-mono text-sm backdrop-blur-sm";
//   const labelClass = "text-[10px] text-cyan-400 font-mono tracking-widest uppercase mb-2 block flex items-center gap-2";

//   return (
//     <div className="min-h-screen text-cyan-100 selection:bg-cyan-500/30 relative overflow-hidden font-sans">
//       {/* Background Effect */}
//       <div className="absolute inset-0 bg-slate-950 bg-[url('/circuit-board.svg')] bg-center opacity-20 mix-blend-screen pointer-events-none" />
//       <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50 z-50" />

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">

//         {/* Header */}
//         <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
//           <div className="flex items-center gap-4">
//             <button
//               onClick={() => navigate(-1)}
//               className="group flex items-center justify-center w-12 h-12 rounded-full border border-cyan-500/20 hover:border-cyan-400 bg-black/40 hover:bg-cyan-950/50 transition-all duration-300"
//             >
//               <ArrowLeft size={24} className="text-slate-400 group-hover:text-cyan-400 transition-colors" />
//             </button>

//             <div>
//               <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono tracking-[0.2em] uppercase mb-1 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]">
//                 <ShieldCheck size={14} />
//                 <span>Secure // Protocol_v4.2</span>
//               </div>
//               <h1 className="text-4xl sm:text-5xl md:text-6xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-cyan-400 drop-shadow-[0_0_30px_rgba(6,182,212,0.4)]">
//                 PAYMENT_GATEWAY
//               </h1>
//             </div>
//           </div>
//         </header>

//         <form onSubmit={handleFinalPayment} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

//           {/* Left Column: Input Forms */}
//           <div className="lg:col-span-7 space-y-8">

//             {/* Shipping Info */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 p-6 sm:p-8 rounded-[2rem] relative overflow-hidden group"
//             >
//               <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
//                 <User size={100} className="text-cyan-500" />
//               </div>

//               <h2 className="text-xl font-black text-white italic uppercase mb-6 flex items-center gap-3">
//                 <span className="w-2 h-8 bg-cyan-500 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.8)]" />
//                 Identity & Shipping
//               </h2>

//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 relative z-10">
//                 <div className="col-span-1 sm:col-span-2">
//                   <label className={labelClass}>Full Name <span className="text-fuchsia-500">*</span></label>
//                   <input required placeholder="ENTER_FULL_NAME" defaultValue={profile.name} className={inputClass} />
//                 </div>
//                 <div>
//                   <label className={labelClass}>Contact Signal <span className="text-fuchsia-500">*</span></label>
//                   <input required placeholder="PHONE_NUMBER" defaultValue={profile.phone} className={inputClass} />
//                 </div>
//                 <div>
//                   <label className={labelClass}>Drop Zone</label>
//                   <select className={`${inputClass} appearance-none cursor-pointer`}>
//                     {profile.addresses.map(addr => <option key={addr} className="bg-slate-900 text-slate-300">{addr}</option>)}
//                   </select>
//                 </div>
//               </div>
//             </motion.div>

//             {/* Payment Info */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.1 }}
//               className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 p-6 sm:p-8 rounded-[2rem] relative overflow-hidden group"
//             >
//               <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
//                 <CreditCard size={100} className="text-fuchsia-500" />
//               </div>

//               <h2 className="text-xl font-black text-white italic uppercase mb-6 flex items-center gap-3">
//                 <span className="w-2 h-8 bg-fuchsia-500 rounded-full shadow-[0_0_15px_rgba(217,70,239,0.8)]" />
//                 Credit Interface
//               </h2>

//               <div className="space-y-5 relative z-10">
//                 <div>
//                   <label className={labelClass}>Card Sequence <span className="text-fuchsia-500">*</span></label>
//                   <div className="relative">
//                     <input required placeholder="0000 0000 0000 0000" className={`${inputClass} pl-12`} />
//                     <CreditCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500" />
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-2 gap-5">
//                   <div>
//                     <label className={labelClass}>Validity (MM/YY) <span className="text-fuchsia-500">*</span></label>
//                     <input required placeholder="MM/YY" className={inputClass} />
//                   </div>
//                   <div>
//                     <label className={labelClass}>Security Code <span className="text-fuchsia-500">*</span></label>
//                     <div className="relative">
//                       <input required placeholder="CVC" type="password" className={inputClass} />
//                       <Lock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" />
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           </div>

//           {/* Right Column: Order Review */}
//           <div className="lg:col-span-5">
//             <motion.div
//               initial={{ opacity: 0, x: 20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: 0.2 }}
//               className="sticky top-8 bg-slate-900/80 backdrop-blur-xl border-2 border-double border-cyan-500/40 p-6 sm:p-8 rounded-[2.5rem] shadow-[0_0_40px_rgba(6,182,212,0.1)]"
//             >
//               <h2 className="text-xl font-black italic uppercase mb-6 flex items-center gap-3 text-cyan-100">
//                 <ScanLine className="text-cyan-400 animate-pulse" />
//                 Manifest Review
//               </h2>

//               {/* Items List */}
//               <div className="space-y-3 mb-8 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent">
//                 {items.map(item => {
//                   const isSelected = selectedIds.includes(item.id);
//                   return (
//                     <div
//                       key={item.id}
//                       onClick={() => setSelectedIds(prev => isSelected ? prev.filter(i => i !== item.id) : [...prev, item.id])}
//                       className={`
//                         relative flex items-center gap-4 p-3 rounded-xl border transition-all duration-300 cursor-pointer group
//                         ${isSelected
//                           ? "bg-cyan-950/40 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
//                           : "bg-black/20 border-white/5 opacity-50 hover:opacity-80"}
//                       `}
//                     >
//                       {/* Selection Indicator */}
//                       <div className={`
//                         w-5 h-5 rounded border flex items-center justify-center transition-all
//                         ${isSelected ? "bg-cyan-500 border-cyan-400" : "border-slate-600 bg-transparent"}
//                       `}>
//                         {isSelected && <CheckCircle2 size={12} className="text-black" />}
//                       </div>

//                       <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10 relative">
//                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
//                          {isSelected && <div className="absolute inset-0 bg-cyan-500/20 mix-blend-overlay" />}
//                       </div>

//                       <div className="flex-1 min-w-0">
//                         <div className="text-[10px] font-mono text-cyan-600 mb-0.5">ID: {item.id}</div>
//                         <div className={`text-xs font-bold uppercase truncate ${isSelected ? "text-white" : "text-slate-500"}`}>
//                           {item.name}
//                         </div>
//                       </div>

//                       <div className="text-right">
//                          <div className="text-[10px] text-slate-500">x{item.qty}</div>
//                          <div className="text-sm font-black font-mono text-cyan-400">${item.price}</div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>

//               {/* Summary Calculations */}
//               <div className="space-y-3 border-t border-dashed border-cyan-500/30 pt-6 mb-8 font-mono text-sm">
//                 <div className="flex justify-between text-cyan-200/60">
//                   <span>SUBTOTAL_CORE</span>
//                   <span>${subtotal.toLocaleString()}</span>
//                 </div>
//                 <div className="flex justify-between text-cyan-200/60">
//                   <span>TAX_PROCESS (10%)</span>
//                   <span>${tax.toLocaleString()}</span>
//                 </div>
//                 <div className="flex justify-between items-end pt-4">
//                   <span className="text-white font-bold text-base tracking-wider">TOTAL_OUTPUT</span>
//                   <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400 tracking-tighter drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">
//                     ${total.toLocaleString()}
//                   </span>
//                 </div>
//               </div>

//               {/* Submit Button */}
//               <button
//                 type="submit"
//                 className="w-full group relative overflow-hidden rounded-2xl p-[2px] focus:outline-none"
//               >
//                 <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-fuchsia-500 to-cyan-600 animate-shimmer bg-[length:200%_100%]" />
//                 <div className="relative bg-slate-950/90 group-hover:bg-slate-950/0 transition-all rounded-2xl px-6 py-5 flex items-center justify-center gap-3">
//                    <Lock size={18} className="text-cyan-400 group-hover:text-white transition-colors" />
//                    <span className="font-black text-lg text-white tracking-widest uppercase group-hover:scale-105 transition-transform">
//                      INITIALIZE TRANSACTION
//                    </span>
//                    <Cpu size={18} className="text-fuchsia-400 animate-spin-slow group-hover:text-white transition-colors" />
//                 </div>
//               </button>

//               <p className="text-center mt-4 text-[10px] text-slate-500 font-mono tracking-widest flex justify-center items-center gap-2">
//                 <Lock size={10} /> 256-BIT ENCRYPTED CONNECTION
//               </p>

//             </motion.div>
//           </div>

//         </form>
//       </div>
//     </div>
//   );
// }
"use client";

import { useCart } from "@/store/cartStore";
import { useUserStore } from "@/store/userStore";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Globe,
  Lock,
  MapPin,
  ScanLine,
  ShieldCheck,
  Smartphone,
  User,
  Zap
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function makeOrderId() {
  return `ORD-${Math.random().toString(36).toUpperCase().substring(2, 9)}`;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, removeItem } = useCart();
  const { addOrder, profile } = useUserStore();

  // 초기에는 모든 아이템 선택
  const [selectedIds, setSelectedIds] = useState<number[]>(items.map(i => i.id));

  // 계산 로직
  const selectedItems = items.filter(item => selectedIds.includes(item.id));
  const subtotal = selectedItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handleFinalPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0) return alert("Select items to process.");

    const orderItems = selectedItems.map((it) => ({ productId: it.id, qty: it.qty }));
    const newOrder = {
      id: makeOrderId(),
      date: new Date().toLocaleDateString(),
      items: orderItems,
      total: total,
      status: 'Processing' as const,
    };

    addOrder(newOrder);
    selectedIds.forEach(id => removeItem(id));
    navigate("/payment-success", { state: newOrder });
  };

  // 공통 스타일 정의 (CartPage 테마 적용)
  const inputGroupClass = "relative group";
  const inputClass = "w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-4 pl-12 text-slate-200 placeholder:text-slate-600 focus:border-cyan-500/50 focus:shadow-[0_0_20px_rgba(6,182,212,0.15)] focus:bg-slate-900/80 outline-none transition-all font-mono text-sm backdrop-blur-sm";
  const iconClass = "absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors";
  const labelClass = "text-[10px] text-cyan-500/70 font-mono tracking-widest uppercase mb-2 block font-bold pl-1";
  const sectionHeaderClass = "text-xl sm:text-2xl font-black text-white italic uppercase tracking-tighter mb-6 flex items-center gap-3";

  return (
    <div className="min-h-screen text-slate-200 selection:bg-cyan-500/30 relative font-sans bg-slate-950 flex flex-col">
      {/* Background Effect */}
      <div className="fixed inset-0 bg-[url('/circuit-board.svg')] bg-center opacity-5 mix-blend-screen pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-14 relative z-10 w-full flex-1">

        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-12">
          <div className="flex items-start gap-4 sm:gap-6">
            <button
              onClick={() => navigate(-1)}
              className="group relative flex items-center justify-center
                         w-10 h-10 sm:w-12 sm:h-12
                         transition-all duration-300 cursor-pointer flex-shrink-0
                         border border-white/10 rounded-full hover:bg-cyan-500/20 hover:border-cyan-500/30"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400 group-hover:text-cyan-300 transition-colors" />
            </button>

            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-2 sm:mb-3">
                 <span className="text-cyan-400 text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase px-2 sm:px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-md flex items-center gap-2">
                  <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4" /> Secure Gateway // TLS 1.3
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white italic tracking-tighter uppercase leading-[0.9]">
                Finalize Transaction
              </h1>
              <p className="text-cyan-500/60 font-mono text-[10px] sm:text-sm uppercase tracking-tighter mt-2 pl-1">
                Enter encryption keys (Payment Details) below
              </p>
            </div>
          </div>
        </header>

        <form onSubmit={handleFinalPayment} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* LEFT COLUMN: Input Forms (7 Columns) */}
          <div className="lg:col-span-7 space-y-8">

            {/* Section 1: Identity & Shipping */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/[0.02] border border-white/5 p-6 sm:p-8 rounded-[2rem] relative overflow-hidden group hover:border-cyan-500/20 transition-all"
            >
              <h2 className={sectionHeaderClass}>
                <span className="w-1.5 h-8 bg-cyan-500 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.8)]" />
                Shipping Protocol
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                <div className="col-span-1 sm:col-span-2">
                  <label className={labelClass}>Recipient ID</label>
                  <div className={inputGroupClass}>
                    <User size={16} className={iconClass} />
                    <input required placeholder="FULL NAME" defaultValue={profile.name} className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Comms Channel</label>
                  <div className={inputGroupClass}>
                    <Smartphone size={16} className={iconClass} />
                    <input required placeholder="MOBILE NUMBER" defaultValue={profile.phone} className={inputClass} />
                  </div>
                </div>

                <div>
                   <label className={labelClass}>Target Sector</label>
                   <div className={inputGroupClass}>
                    <MapPin size={16} className={iconClass} />
                     {/* Select styling hack to match input */}
                    <select className={`${inputClass} appearance-none cursor-pointer text-slate-300`}>
                      {profile.addresses.map(addr => <option key={addr} className="bg-slate-900">{addr}</option>)}
                    </select>
                   </div>
                </div>
              </div>
            </motion.div>

            {/* Section 2: Payment */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/[0.02] border border-white/5 p-6 sm:p-8 rounded-[2rem] relative overflow-hidden group hover:border-fuchsia-500/20 transition-all"
            >
            <h2 className={sectionHeaderClass}>
  {/* bg-blue-600으로 변경 및 그림자 RGB(37,99,235) 적용 */}
  <span className="w-1.5 h-8 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.8)]" />
  Credit Interface
</h2>

              <div className="space-y-6 relative z-10">
                <div>
                  <label className={labelClass}>Card Sequence</label>
                  <div className={inputGroupClass}>
                    <CreditCard size={16} className={iconClass} />
                    <input required placeholder="0000 0000 0000 0000" className={inputClass} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Validity</label>
                    <div className={inputGroupClass}>
                      <Globe size={16} className={iconClass} />
                      <input required placeholder="MM / YY" className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Security Code</label>
                    <div className={inputGroupClass}>
                      <Lock size={16} className={iconClass} />
                      <input required placeholder="CVC" type="password" className={inputClass} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Order Review (5 Columns) */}
          <div className="lg:col-span-5 w-full">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="sticky top-8 bg-slate-900 border border-cyan-500/30 p-6 sm:p-8 rounded-[2.5rem] shadow-[0_0_60px_rgba(6,182,212,0.05)]"
            >
               {/* Decorative top line */}
               <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-50" />

              <h2 className="text-xl font-black italic uppercase mb-6 flex items-center gap-3 text-white">
                <ScanLine className="text-cyan-500 animate-pulse" />
                Manifest Review
              </h2>

              {/* Items List */}
              <div className="space-y-3 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {items.length === 0 && (
                     <div className="text-center py-8 text-slate-600 font-mono text-xs uppercase tracking-widest">
                        No active modules
                     </div>
                )}

                {items.map(item => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedIds(prev => isSelected ? prev.filter(i => i !== item.id) : [...prev, item.id])}
                      className={`
                        relative flex items-center gap-4 p-3 rounded-2xl border transition-all duration-300 cursor-pointer group select-none
                        ${isSelected
                          ? "bg-cyan-950/30 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                          : "bg-white/[0.02] border-white/5 opacity-50 hover:opacity-80"}
                      `}
                    >
                      {/* Selection Toggle */}
                      <div className={`
                        w-5 h-5 rounded-md border flex items-center justify-center transition-all flex-shrink-0
                        ${isSelected ? "bg-cyan-500 border-cyan-400" : "border-slate-700 bg-transparent"}
                      `}>
                        {isSelected && <CheckCircle2 size={12} className="text-black" />}
                      </div>

                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 relative bg-slate-800 flex-shrink-0">
                         <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-80" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className={`text-xs font-bold uppercase truncate ${isSelected ? "text-white" : "text-slate-500"}`}>
                          {item.name}
                        </div>
                        <div className="text-[10px] font-mono text-cyan-500/60">Unit: {item.id}</div>
                      </div>

                      <div className="text-right flex-shrink-0">
                          <div className="text-[10px] text-slate-500 mb-0.5">x{item.qty}</div>
                          <div className="text-xs font-black font-mono text-white">${item.price}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Calculations */}
              <div className="space-y-3 pt-6 border-t border-dashed border-white/10 mb-8 font-mono text-sm">
                <div className="flex justify-between text-slate-400">
                  <span className="text-[10px] uppercase tracking-widest">Subtotal</span>
                  <span>${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span className="text-[10px] uppercase tracking-widest">Process Tax (10%)</span>
                  <span>${tax.toLocaleString()}</span>
                </div>

                <div className="py-4 mt-2 border-t border-white/10 flex justify-between items-end">
                  <span className="text-white font-bold text-xs uppercase tracking-[0.2em]">Total Output</span>
                  <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-white tracking-tighter drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                    ${total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
           <div className="w-full flex justify-center items-center mt-6">

  <motion.button
    type="submit"
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="
      group relative flex items-center justify-center
      overflow-hidden rounded-full p-[1px]
      focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:ring-offset-2 focus:ring-offset-slate-950

      /* ✅ 반응형 크기 표준 (Responsive Web Standard) */
      /* 1. Mobile (<640px): w-full로 터치 영역 확보. max-w를 주어 너무 길어지지 않게 제어 */
      w-full max-w-[350px]

      /* 2. Tablet/PC (>=640px): 내용물에 맞게(w-auto) 줄어들고, 최소 너비 보장 */
      sm:w-auto sm:max-w-none sm:min-w-[280px] md:min-w-[320px]
    "
  >
    {/* 1. 배경 애니메이션 (Cyan & Blue Shimmer) */}
    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-600 to-cyan-400 animate-[shimmer_2s_linear_infinite] bg-[length:200%_100%]" />

    {/* 2. 내부 컨텐츠 영역 */}
    <div className="
      relative w-full h-full
      bg-slate-950
      group-hover:bg-cyan-950/30
      transition-colors duration-300
      rounded-full

      /* 내부 패딩: 모바일은 좁게, PC는 넓게 */
      py-4 px-6 md:py-5 md:px-10

      flex items-center justify-center gap-3 md:gap-4
      backdrop-blur-sm
    ">

      <Lock
        size={18}
        className="text-cyan-500 group-hover:text-white transition-colors duration-300 shrink-0"
      />

      <span className="
        font-black uppercase tracking-[0.2em] text-white
        text-[10px] sm:text-xs md:text-sm
        whitespace-nowrap
        group-hover:text-cyan-50 transition-colors
        group-hover:drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]
      ">
        Confirm Order
      </span>

      <Zap
        size={18}
        className="text-blue-500 group-hover:text-cyan-200 transition-colors duration-300 shrink-0"
      />

    </div>

    {/* 3. 글로우 효과 */}
    <div className="absolute inset-0 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.0)] group-hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-shadow duration-300 pointer-events-none" />

  </motion.button>

</div>
              <div className="text-center mt-6 flex justify-center gap-4 opacity-30">

              </div>

            </motion.div>
          </div>

        </form>
      </div>
    </div>
  );
}
