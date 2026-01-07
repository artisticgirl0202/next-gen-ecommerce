// src/hooks/useCustomCursor.ts
import { useEffect, useState } from "react";

export const useCustomCursor = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [cursorType, setCursorType] = useState("default");

  useEffect(() => {
    const mouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const mouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // ✅ 개선된 판별 로직:
      // 1. 요소 자체가 버튼/링크 태그인 경우
      // 2. CSS 스타일이 cursor: pointer인 경우
      // 3. 부모 요소 중 'group' 또는 'cursor-pointer' 클래스를 가진 요소가 있는 경우 (.closest 사용)
      const isClickable =
        ['BUTTON', 'A', 'INPUT', 'SELECT'].includes(target.tagName) ||
        window.getComputedStyle(target).cursor === "pointer" ||
        target.closest('.group') !== null ||
        target.closest('.cursor-pointer') !== null;

      setCursorType(isClickable ? "hover" : "default");
    };

    window.addEventListener("mousemove", mouseMove);
    window.addEventListener("mouseover", mouseOver);

    return () => {
      window.removeEventListener("mousemove", mouseMove);
      window.removeEventListener("mouseover", mouseOver);
    };
  }, []);

  return { mousePos, cursorType };
};
