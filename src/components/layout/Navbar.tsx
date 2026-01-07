
// "use client";

// import { useAuth } from "@/store/authStore";
// import { useCart } from "@/store/cartStore";
// import { AnimatePresence, motion } from "framer-motion";
// import { LogOut, Search, ShoppingCart, X, Zap } from "lucide-react";
// import React, { useState } from "react";

// type Props = {
//   onView: (v: string) => void;
//   // ⭐ 1. 타입을 추가합니다.
//   onCategorySelect: (cat: string) => void;
//   searchQuery: string;
//   setSearchQuery: (s: string) => void;
//   addedFeedback: boolean;
// };
// const Navbar: React.FC<Props> = ({
//   onView,
//   onCategorySelect,
//   searchQuery,
//   setSearchQuery,
//   addedFeedback
// }) => {
//   const { user, logout } = useAuth();
//   const [isSearchOpen, setIsSearchOpen] = useState(false);

//   const totalQty = useCart((state) =>
//     state.items.reduce((acc, item) => acc + item.qty, 0)
//   );

//   return (
//     <nav className="fixed top-0 w-full z-[110] bg-slate-950/90 backdrop-blur-md border-b border-white/5 h-20 flex items-center px-4 md:px-8 justify-between">

//       {/* 1. 로고 섹션 */}
//       <div
//         className="flex items-center gap-2 cursor-pointer shrink-0 group"
//        onClick={() => {
//           onCategorySelect("HOME"); // 카테고리를 홈으로 변경
//           onView("home");           // 필요하다면 뷰를 'home' 리스트로 변경
//         }}
//       >
//         <div className="w-10 h-10 bg-cyan-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] group-hover:rotate-12 transition-transform">
//           <Zap className="text-white" size={24} fill="currentColor" />
//         </div>
//         <h1 className="text-xl font-black tracking-tighter text-white hidden sm:block italic">TECH.CO</h1>
//       </div>

//       {/* 2. 중앙 & 우측 통합 메뉴 */}
//       <div className="flex items-center gap-2 md:gap-5 ml-auto">

//         {/* 애니메이션 검색창 */}
//         <div className="flex items-center">
//           <AnimatePresence>
//             {isSearchOpen && (
//               <motion.div
//                 initial={{ width: 0, opacity: 0 }}
//                 animate={{ width: "250px", opacity: 1 }}
//                 exit={{ width: 0, opacity: 0 }}
//                 className="relative overflow-hidden mr-2"
//               >
//                 <input
//                   type="text"
//                   autoFocus
//                   placeholder="Search Component..."
//                   className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-4 pr-10 text-sm focus:border-cyan-500/50 outline-none text-white transition-all"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                 />
//               </motion.div>
//             )}
//           </AnimatePresence>

//           <button
//             onClick={() => setIsSearchOpen(!isSearchOpen)}
//             className="p-2 text-slate-300 hover:text-cyan-400 transition-colors"
//           >
//             {isSearchOpen ? <X size={22} /> : <Search size={22} />}
//           </button>
//         </div>

//         {/* 장바구니 버튼 + 숫자 애니메이션 */}
//         <button
//           onClick={() => onView('cart')}
//           className="relative p-2 text-slate-300 hover:text-white transition-all group"
//         >
//           <ShoppingCart size={22} className="group-hover:scale-110 transition-transform" />

//           <AnimatePresence>
//             {totalQty > 0 && (
//               <motion.div
//                 // ⭐ key에 totalQty를 넣으면 숫자가 바뀔 때마다 "통통" 튀는 애니메이션이 실행됩니다.
//                 key={totalQty}
//                 initial={{ scale: 1.5, opacity: 0 }}
//                 animate={{
//                   scale: addedFeedback ? [1, 1.6, 1] : 1, // 상품 추가 시 추가 피드백
//                   opacity: 1
//                 }}
//                 exit={{ scale: 0, opacity: 0 }}
//                 className="absolute -top-1 -right-1 bg-cyan-500 text-black text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]"
//               >
//                 {totalQty}
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </button>

//         <div className="h-6 w-[1px] bg-white/10 mx-1 hidden md:block" />

//         {/* 유저 섹션 */}
//         {user ? (
//           <div className="flex items-center gap-3">
//             <button
//               onClick={() => onView('mypage')}
//               className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-cyan-400 border border-cyan-500/30 hover:bg-cyan-600 hover:text-white transition-all shadow-[0_0_10px_rgba(6,182,212,0.2)]"
//             >
//               {user.name.charAt(0).toUpperCase()}
//             </button>
//             <button
//               onClick={() => logout()} // onView('logout') 대신 실제 logout 함수 호출 권장
//               className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
//             >
//               <LogOut size={20} />
//             </button>
//           </div>
//         ) : (
//           <div className="flex items-center gap-2 md:gap-4">
//             <button
//               onClick={() => onView('login')}
//               className="text-sm font-bold text-slate-400 hover:text-white transition-colors"
//             >
//               Sign In
//             </button>
//             <button
//               onClick={() => onView('signup')}
//               className="text-sm font-bold bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all active:scale-95"
//             >
//               Sign Up
//             </button>
//           </div>
//         )}
//       </div>
//     </nav>
//   );
// };

// E:\websiteportfolio\next-gen-ecommerce\next-gen-ecommerce\src\components\layout\Navbar.tsx



// "use client";

// import { useAuth } from "@/store/authStore";
// import { useCart } from "@/store/cartStore";
// import { AnimatePresence, motion } from "framer-motion";
// import { LogOut, Search, ShoppingCart, X, Zap } from "lucide-react";
// import React, { useState } from "react";

// type Props = {
//   onView: (v: string) => void;
//   onCategorySelect: (cat: string) => void;
//   searchQuery: string;
//   setSearchQuery: (s: string) => void;
//   addedFeedback: boolean;
// };

// const Navbar: React.FC<Props> = ({
//   onView,
//   onCategorySelect,
//   searchQuery,
//   setSearchQuery,
//   addedFeedback
// }) => {
//   const { user, logout } = useAuth();
//   const [isSearchOpen, setIsSearchOpen] = useState(false);

//   const totalQty = useCart((state) =>
//     state.items.reduce((acc, item) => acc + item.qty, 0)
//   );

//   return (
//     <nav className="fixed top-0 w-full z-[110] bg-slate-950/90 backdrop-blur-md border-b border-white/5 h-20 flex items-center px-4 md:px-8 justify-between">

//       {/* 1. 로고 섹션 */}
//       <div
//         // ⭐ cursor-pointer 추가됨
//         className="flex items-center gap-2 cursor-pointer shrink-0 group"
//         onClick={() => {
//           onCategorySelect("ALL"); // 보통 홈으로 갈 때는 전체 카테고리("ALL") 혹은 초기화 상태로 둡니다.
//           onView("home");          // ⭐ 'home' 뷰로 전환하여 Home.tsx가 보이도록 함
//         }}
//       >
//         <div className="w-10 h-10 bg-cyan-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] group-hover:rotate-12 transition-transform">
//           <Zap className="text-white" size={24} fill="currentColor" />
//         </div>
//         <h1 className="text-xl font-black tracking-tighter text-white hidden sm:block italic">TECH.CO</h1>
//       </div>

//       {/* 2. 중앙 & 우측 통합 메뉴 */}
//       <div className="flex items-center gap-2 md:gap-5 ml-auto">

//         {/* 애니메이션 검색창 */}
//         <div className="flex items-center">
//           <AnimatePresence>
//             {isSearchOpen && (
//               <motion.div
//                 initial={{ width: 0, opacity: 0 }}
//                 animate={{ width: "250px", opacity: 1 }}
//                 exit={{ width: 0, opacity: 0 }}
//                 className="relative overflow-hidden mr-2"
//               >
//                 <input
//                   type="text"
//                   autoFocus
//                   placeholder="Search Component..."
//                   className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-4 pr-10 text-sm focus:border-cyan-500/50 outline-none text-white transition-all"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                 />
//               </motion.div>
//             )}
//           </AnimatePresence>

//           <button
//             onClick={() => setIsSearchOpen(!isSearchOpen)}
//             // ⭐ cursor-pointer 추가
//             className="p-2 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
//           >
//             {isSearchOpen ? <X size={22} /> : <Search size={22} />}
//           </button>
//         </div>

//         {/* 장바구니 버튼 + 숫자 애니메이션 */}
//         <button
//           onClick={() => onView('cart')}
//           // ⭐ cursor-pointer 추가
//           className="relative p-2 text-slate-300 hover:text-white transition-all group cursor-pointer"
//         >
//           <ShoppingCart size={22} className="group-hover:scale-110 transition-transform" />

//           <AnimatePresence>
//             {totalQty > 0 && (
//               <motion.div
//                 key={totalQty}
//                 initial={{ scale: 1.5, opacity: 0 }}
//                 animate={{
//                   scale: addedFeedback ? [1, 1.6, 1] : 1,
//                   opacity: 1
//                 }}
//                 exit={{ scale: 0, opacity: 0 }}
//                 className="absolute -top-1 -right-1 bg-cyan-500 text-black text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]"
//               >
//                 {totalQty}
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </button>

//         <div className="h-6 w-[1px] bg-white/10 mx-1 hidden md:block" />

//         {/* 유저 섹션 */}
//         {user ? (
//           <div className="flex items-center gap-3">
//             <button
//               onClick={() => onView('mypage')}
//               // ⭐ cursor-pointer 추가
//               className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-cyan-400 border border-cyan-500/30 hover:bg-cyan-600 hover:text-white transition-all shadow-[0_0_10px_rgba(6,182,212,0.2)] cursor-pointer"
//             >
//               {user.name.charAt(0).toUpperCase()}
//             </button>
//             <button
//               onClick={() => logout()}
//               // ⭐ cursor-pointer 추가
//               className="p-2 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
//             >
//               <LogOut size={20} />
//             </button>
//           </div>
//         ) : (
//           <div className="flex items-center gap-2 md:gap-4">
//             <button
//               onClick={() => onView('login')}
//               // ⭐ cursor-pointer 추가
//               className="text-sm font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
//             >
//               Sign In
//             </button>
//             <button
//               onClick={() => onView('signup')}
//               // ⭐ cursor-pointer 추가
//               className="text-sm font-bold bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all active:scale-95 cursor-pointer"
//             >
//               Sign Up
//             </button>
//           </div>
//         )}
//       </div>
//     </nav>
//   );
// };

// export default Navbar;
// // next-gen-ecommerce/src/components/layout/Navbar.tsx
// "use client";

// import { useAuth } from "@/store/authStore";
// import { useCart } from "@/store/cartStore";
// import { AnimatePresence, motion } from "framer-motion";
// import { LogOut, Search, ShoppingCart, X, Zap } from "lucide-react";
// import React, { useEffect, useRef, useState } from "react";

// type Props = {
//   onView: (v: string) => void;
//   onCategorySelect: (cat: string) => void;
//   searchQuery: string;
//   setSearchQuery: (s: string) => void;
//   addedFeedback: boolean;
// };

// const Navbar: React.FC<Props> = ({
//   onView,
//   onCategorySelect,
//   searchQuery,
//   setSearchQuery,
//   addedFeedback
// }) => {
//   const { user, logout } = useAuth();
//   const [isSearchOpen, setIsSearchOpen] = useState(false);
//   const inputRef = useRef<HTMLInputElement>(null);

//   // 장바구니 총 수량 계산
//   const totalQty = useCart((state) =>
//     state.items.reduce((acc, item) => acc + item.qty, 0)
//   );

//   // 검색창이 열릴 때 자동으로 포커스
//   useEffect(() => {
//     if (isSearchOpen && inputRef.current) {
//       inputRef.current.focus();
//     }
//   }, [isSearchOpen]);

//   // 검색어 입력 핸들러
//   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchQuery(e.target.value); // 부모 컴포넌트의 검색어 상태 업데이트 (실시간 필터링 트리거)
//   };

//   // 검색창 닫기 핸들러 (내용 초기화 옵션)
//   const toggleSearch = () => {
//     if (isSearchOpen && searchQuery) {
//       // 검색어가 있을 때 닫기 버튼을 누르면 검색어 초기화 (선택 사항)
//       setSearchQuery("");
//     }
//     setIsSearchOpen(!isSearchOpen);
//   };

//   return (
//     <nav className="fixed top-0 w-full z-[110] bg-slate-950/90 backdrop-blur-md border-b border-white/5 h-20 flex items-center px-4 md:px-8 justify-between select-none ">

//       {/* 1. 로고 섹션 (홈으로 이동 및 카테고리 초기화) */}
//       <div
//   /* cursor-none을 직접 주어 기본 커서를 숨기고,
//      useCustomCursor가 감지할 수 있도록 cursor-pointer나 group 클래스는 유지합니다. */
//   className="flex items-center gap-2 shrink-0 group cursor-pointer"
//   onClick={() => {
//     onCategorySelect("ALL");
//     onView("home");
//     setSearchQuery("");
//   }}
// >
//   {/* 내부 요소들에서 pointer-events-none을 삭제하세요!
//       그래야 마우스가 이 위에 올라왔을 때 커서 컴포넌트가 '호버'를 인식합니다. */}
//   <div className="w-10 h-10 bg-cyan-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] group-hover:rotate-12 transition-transform cursor-pointer">
//     <Zap className="text-white cursor-pointer" size={24} fill="currentColor" />
//   </div>
//   <h1 className="text-xl font-black tracking-tighter text-white hidden sm:block italic cursor-pointer">
//     TECH.CO
//   </h1>
// </div>

//       {/* 2. 중앙 & 우측 통합 메뉴 */}
//       <div className="flex items-center gap-2 md:gap-5 ml-auto">

//         {/* --- 검색 기능 구현 영역 --- */}
//         <div className="flex items-center">
//           <AnimatePresence>
//             {isSearchOpen && (
//               <motion.div
//                 initial={{ width: 0, opacity: 0 }}
//                 animate={{ width: "250px", opacity: 1 }}
//                 exit={{ width: 0, opacity: 0 }}
//                 className="relative overflow-hidden mr-2"
//               >
//                 <input
//                   ref={inputRef}
//                   type="text"
//                   placeholder="Search Product..."
//                   className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-4 pr-10 text-sm focus:border-cyan-500/50 outline-none text-white transition-all placeholder:text-slate-500"
//                   value={searchQuery}
//                   onChange={handleSearchChange} // 입력 시 실시간 검색
//                   autoComplete="off" // 브라우저 자동완성 방지
//                 />
//               </motion.div>
//             )}
//           </AnimatePresence>

//           <button
//             onClick={toggleSearch}
//             className="p-2 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer rounded-full "
//             title={isSearchOpen ? "Close Search" : "Open Search"}
//           >
//             {isSearchOpen ? <X size={22} /> : <Search size={22} />}
//           </button>
//         </div>
//         {/* ------------------------- */}

//         {/* 장바구니 버튼 */}
//         <button
//           onClick={() => onView('cart')}
//           className="relative p-2 text-slate-300 hover:text-white transition-all group cursor-pointer rounded-full "
//         >
//           <ShoppingCart size={22} className="group-hover:scale-110 transition-transform" />

//           <AnimatePresence>
//             {totalQty > 0 && (
//               <motion.div
//                 key={totalQty}
//                 initial={{ scale: 1.5, opacity: 0 }}
//                 animate={{
//                   scale: addedFeedback ? [1, 1.6, 1] : 1,
//                   opacity: 1
//                 }}
//                 exit={{ scale: 0, opacity: 0 }}
//                 className="absolute -top-1 -right-1 bg-cyan-500 text-black text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]"
//               >
//                 {totalQty}
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </button>

//         <div className="h-6 w-[1px] bg-white/10 mx-1 hidden md:block" />

//         {/* 유저 섹션 (로그인/로그아웃/마이페이지) */}
//         {user ? (
//           <div className="flex items-center gap-3">
//             <button
//               onClick={() => onView('mypage')}
//               className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-cyan-400 border border-cyan-500/30 hover:bg-cyan-600 hover:text-white transition-all shadow-[0_0_10px_rgba(6,182,212,0.2)] cursor-pointer"
//             >
//               {user.name.charAt(0).toUpperCase()}
//             </button>
//             <button
//               onClick={() => logout()}
//               className="p-2 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
//               title="Logout"
//             >
//               <LogOut size={20} />
//             </button>
//           </div>
//         ) : (
//           <div className="flex items-center gap-2 md:gap-4">
//             <button
//               onClick={() => onView('login')}
//               className="text-sm font-bold text-slate-400 hover:text-white transition-colors cursor-pointer px-2"
//             >
//               Sign In
//             </button>
//             <button
//               onClick={() => onView('signup')}
//               className="text-sm font-bold bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all active:scale-95 cursor-pointer"
//             >
//               Sign Up
//             </button>
//           </div>
//         )}
//       </div>
//     </nav>
//   );
// };

// export default Navbar;
// next-gen-ecommerce/src/components/layout/Navbar.tsx
"use client";

import { useAuth } from "@/store/authStore";
import { useCart } from "@/store/cartStore";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Search, ShoppingCart, X, Zap } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

// 화면 크기 감지 훅
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);
  return matches;
}

type Props = {
  onView: (v: string) => void;
  onCategorySelect: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (s: string) => void;
  addedFeedback: boolean;
};

const Navbar: React.FC<Props> = ({
  onView,
  onCategorySelect,
  searchQuery,
  setSearchQuery,
  addedFeedback
}) => {
  const { user, logout } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isMobile = useMediaQuery("(max-width: 767px)");
  const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1023px)");

  const totalQty = useCart((state) =>
    state.items.reduce((acc, item) => acc + item.qty, 0)
  );

  // 너비 설정 로직 수정
  const getSearchWidth = () => {
    // ✅ 모바일: 로고가 숨겨지므로 화면 너비에 맞춰 넓게 설정 (패딩 고려)
    if (isMobile) return "calc(100vw - 120px)";
    if (isTablet) return "300px";
    return "450px";
  };

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const toggleSearch = () => {
    if (isSearchOpen && searchQuery) {
      setSearchQuery("");
    }
    setIsSearchOpen(!isSearchOpen);
  };

  return (
    <nav className="fixed top-0 w-full z-[110] bg-slate-950/90 backdrop-blur-md border-b border-white/5 h-20 flex items-center px-4 md:px-8 justify-between select-none ">

      {/* 1. 로고 섹션 */}
      <div
        // ✅ 모바일에서 검색창이 열리면 로고를 숨김 (hidden)
        className={`flex items-center gap-2 shrink-0 group cursor-pointer ${isSearchOpen && isMobile ? "hidden" : "flex"}`}
        onClick={() => {
          onCategorySelect("ALL");
          onView("home");
          setSearchQuery("");
        }}
      >
        <div className="w-10 h-10 bg-cyan-400/80 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] group-hover:rotate-12 transition-transform cursor-pointer">
          <Zap className="text-white cursor-pointer" size={24} fill="currentColor" />
        </div>
        <h1 className="text-xl font-black tracking-tighter text-white hidden sm:block italic cursor-pointer">
          TECH.CO
        </h1>
      </div>

      {/* 2. 중앙 & 우측 통합 메뉴 */}
      {/* 로고가 사라졌을 때 메뉴들을 우측 정렬 유지하기 위해 ml-auto 사용 */}
      <div className="flex items-center gap-2 md:gap-5 ml-auto">

        {/* --- 검색 기능 구현 영역 --- */}
        <div className="flex items-center relative">
  <AnimatePresence>
    {isSearchOpen && (
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={{
          width: getSearchWidth(),
          opacity: 1
        }}
        exit={{ width: 0, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="
          relative
          mr-2

          /* 2. 내부 input이 포커스되면(focus-within) overflow를 visible로 변경하여 그림자가 밖으로 나가게 허용 */
          focus-within:overflow-visible
          /* 3. 포커스 시 다른 요소(검색 버튼 등)보다 위에 뜨도록 z-index 상향 */
          focus-within:z-50
        "
      >
        <input
          ref={inputRef}
          type="text"
          placeholder={isMobile ? "Search..." : "Search Product..."}
          className="
            w-full
            /* 4. input 자체의 overflow-hidden 제거 (그림자 잘림 방지) */
            border border-white/10
            rounded-full
            py-2 pl-4 pr-10
            outline-none text-white transition-all
            placeholder:text-slate-500
            bg-transparent

            relative
            /* 5. input에는 쉐도우와 테두리 스타일만 남김 (z-index나 overflow 제어는 부모로 이동) */
            focus:border-cyan-500/50
            focus:shadow-[0_0_15px_2px_rgba(6,182,212,0.4)]
            text-xs md:text-sm lg:text-base
          "
          value={searchQuery}
          onChange={handleSearchChange}
          autoComplete="off"
        />
      </motion.div>
    )}
  </AnimatePresence>

  <button
    onClick={toggleSearch}
    className="p-2 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer rounded-full "
    title={isSearchOpen ? "Close Search" : "Open Search"}
  >
    {isSearchOpen ? <X size={22} /> : <Search size={22} />}
  </button>
</div>
        {/* ------------------------- */}

        {/* 장바구니 버튼 */}
        <button
          onClick={() => onView('cart')}
          className="relative p-2 text-slate-300 hover:text-white transition-all group cursor-pointer rounded-full "
        >
          <ShoppingCart size={22} className="group-hover:scale-110 transition-transform" />

          <AnimatePresence>
            {totalQty > 0 && (
              <motion.div
                key={totalQty}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{
                  scale: addedFeedback ? [1, 1.6, 1] : 1,
                  opacity: 1
                }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute -top-1 -right-1 bg-cyan-500 text-black text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]"
              >
                {totalQty}
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        <div className="h-6 w-[1px] bg-white/10 mx-1 hidden md:block" />

        {/* 유저 섹션 */}
        {user ? (
          <div className="flex items-center gap-3">
            <button
              onClick={() => onView('mypage')}
              className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-cyan-400 border border-cyan-500/30 hover:bg-cyan-600 hover:text-white transition-all shadow-[0_0_10px_rgba(6,182,212,0.2)] cursor-pointer"
            >
              {user.name.charAt(0).toUpperCase()}
            </button>
            <button
              onClick={() => logout()}
              className="p-2 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => onView('login')}
              className="text-sm font-bold text-slate-400 hover:text-white transition-colors cursor-pointer px-2"
            >
              Sign In
            </button>
            <button
              onClick={() => onView('signup')}
              className="text-sm font-bold bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all active:scale-95 cursor-pointer"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
