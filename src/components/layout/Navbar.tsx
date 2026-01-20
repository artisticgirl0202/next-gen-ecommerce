// next-gen-ecommerce/src/components/layout/Navbar.tsx
'use client';

import { useAuth } from '@/store/authStore';
import { useCart } from '@/store/cartStore';
import { AnimatePresence, motion } from 'framer-motion';
import { LogOut, Search, ShoppingCart, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

// 화면 크기 감지 훅
function useMediaQuery(query: string) {
  const isClient = typeof window !== 'undefined';
  const [matches, setMatches] = useState<boolean>(() =>
    isClient ? window.matchMedia(query).matches : false,
  );
  useEffect(() => {
    if (!isClient) return undefined;
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query, isClient]);
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
  addedFeedback,
}) => {
  const { user, logout } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');

  const totalQty = useCart((state) =>
    state.items.reduce((acc, item) => acc + item.qty, 0),
  );

  // 너비 설정 로직 수정
  const getSearchWidth = () => {
    // ✅ 모바일: 로고가 숨겨지므로 화면 너비에 맞춰 넓게 설정 (패딩 고려)
    if (isMobile) return 'calc(100vw - 120px)';
    if (isTablet) return '300px';
    return '450px';
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
      setSearchQuery('');
    }
    setIsSearchOpen(!isSearchOpen);
  };

  return (
    <nav className="fixed top-0 w-full z-[110] bg-slate-950/90 backdrop-blur-md border-b border-white/5 h-20 flex items-center px-4 md:px-8 justify-between select-none ">
      {/* 1. 로고 섹션 */}
      <div
        // ✅ 모바일에서 검색창이 열리면 로고를 숨김 (hidden)
        className={`flex items-center gap-2 shrink-0 group cursor-pointer ${isSearchOpen && isMobile ? 'hidden' : 'flex'}`}
        onClick={() => {
          onCategorySelect('ALL');
          onView('home');
          setSearchQuery('');
        }}
      >
        <div className="w-10 h-10 bg-cyan-400/80 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] group-hover:rotate-12 transition-transform cursor-pointer">
          <img
            src="/logo.png"
            alt="TECH.CO Logo"
            className="w-full h-full object-contain"
          />
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
                  opacity: 1,
                }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
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
                  placeholder={isMobile ? 'Search...' : 'Search Product...'}
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
            title={isSearchOpen ? 'Close Search' : 'Open Search'}
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
          <ShoppingCart
            size={22}
            className="group-hover:scale-110 transition-transform"
          />

          <AnimatePresence>
            {totalQty > 0 && (
              <motion.div
                key={totalQty}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{
                  scale: addedFeedback ? [1, 1.6, 1] : 1,
                  opacity: 1,
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
              className="
    group relative px-4 py-2 rounded-lg overflow-hidden
    transition-all duration-300 ease-out cursor-pointer
    /* 호버 시 배경이 아주 살짝 켜짐 */
    hover:bg-cyan-500/5
  "
            >
              <span className="relative z-10 flex items-center gap-2">
                {/* 1. Power Dot: 평소엔 꺼져있다가(Slate-600) 호버 시 켜짐(Cyan-400 + Glow) */}
                <span
                  className="
      w-1.5 h-1.5 rounded-full bg-slate-600 
      group-hover:bg-cyan-400 group-hover:shadow-[0_0_8px_rgba(34,211,238,0.8)] 
      transition-all duration-300
    "
                />

                {/* 2. Text: 기계적인 폰트 스타일 */}
                <span
                  className="
      text-xs font-black uppercase tracking-widest 
      text-slate-500 group-hover:text-cyan-400 
      transition-colors duration-300 pt-0.5
    "
                >
                  Sign In
                </span>
              </span>

              {/* 3. Bottom Laser Line: 호버 시 바닥에 살짝 지나가는 라인 */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-cyan-500/50 group-hover:w-1/2 transition-all duration-500 ease-out opacity-0 group-hover:opacity-100" />
            </button>
            <button
              onClick={() => onView('signup')}
              className="
                relative group overflow-hidden rounded-xl px-6 py-2
                bg-slate-900/50 border border-cyan-500/30
                hover:bg-cyan-500/10 hover:border-cyan-400/60 
                hover:shadow-[0_0_20px_-5px_rgba(6,182,212,0.4)]
                transition-all duration-300 ease-out active:scale-95
                flex items-center justify-center cursor-pointer
            "
            >
              {/* 텍스트 스타일: 기계적인 느낌의 두꺼운 폰트 + 자간 넓힘 */}
              <span className="relative z-10 text-xs font-black uppercase tracking-widest text-cyan-400 group-hover:text-cyan-100 transition-colors">
                Sign Up
              </span>

              {/* 하단 글로우 바 (호버 시 나타남) */}
              <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-hover:opacity-100 blur-[2px] transition-opacity duration-300" />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
