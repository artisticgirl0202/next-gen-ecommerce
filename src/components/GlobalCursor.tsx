import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

export const GlobalCursor = () => {
  const [isHovered, setIsHovered] = useState(false);

  // 1. 중심 포인트용 (빠른 반응)
  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);

  // 2. 외곽 링용 (부드러운 따라옴)
  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 }; // 움직임을 조금 더 쫀쫀하게 조정
  const ringX = useSpring(-100, springConfig);
  const ringY = useSpring(-100, springConfig);

  // ✅ 1. 시스템 커서 숨기기 (이전과 동일)
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @media (min-width: 768px) {
        *, body, button, a, input, textarea, select, [role="button"] {
          cursor: none !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      // 마우스 위치 업데이트
      dotX.set(e.clientX);
      dotY.set(e.clientY);
      ringX.set(e.clientX);
      ringY.set(e.clientY);

      const target = e.target as HTMLElement;
      if (!target) return;

      // ✅ 2. 개선된 호버 감지 로직 (getComputedStyle 제거)
      // 스타일(cursor: none)을 이미 적용했으므로, 태그와 속성으로만 판단해야 정확합니다.

      // 검사할 태그 목록
      const interactiveTags = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA', 'LABEL'];

      const isClickable =
        // 1) 직접 태그 매칭
        interactiveTags.includes(target.tagName) ||
        // 2) 부모 중 interactive 태그가 있는지 (아이콘 등을 감싼 버튼 대응)
        target.closest('button') !== null ||
        target.closest('a') !== null ||
        // 3) Tailwind 'cursor-pointer' 클래스 사용 요소
        target.closest('.cursor-pointer') !== null ||
        // 4) 접근성 속성 role="button" 확인
        target.closest('[role="button"]') !== null;

      setIsHovered(isClickable);
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [dotX, dotY, ringX, ringY]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] hidden md:block">
      {/* 1. 중심 포인트 (항상 흰색 점) */}
      <motion.div
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-white rounded-full mix-blend-difference"
        style={{
          x: dotX,
          y: dotY,
          translateX: "-50%", // 정확한 중앙 정렬
          translateY: "-50%"  // 정확한 중앙 정렬
        }}
      />

      {/* 2. 네온 링 (호버 시에만 커짐) */}
      <motion.div
        className="fixed top-0 left-0 rounded-full border border-cyan-400"
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%"
        }}
        animate={{
          // 호버 여부에 따른 크기 변화
          width: isHovered ? 60 : 20,
          height: isHovered ? 60 : 20,
          // 호버 시 배경색 및 글로우 효과 강화
          backgroundColor: isHovered ? "rgba(34, 211, 238, 0.1)" : "transparent",
          boxShadow: isHovered
            ? "0 0 30px rgba(34, 211, 238, 0.6), inset 0 0 10px rgba(34, 211, 238, 0.3)" // 강한 네온
            : "none", // 평소에는 그림자 없음 (깔끔하게)
          borderColor: isHovered ? "rgba(34, 211, 238, 1)" : "rgba(34, 211, 238, 0.5)"
        }}
        transition={{
          type: "tween",
          ease: "backOut",
          duration: 0.2
        }}
      />
    </div>
  );
};
