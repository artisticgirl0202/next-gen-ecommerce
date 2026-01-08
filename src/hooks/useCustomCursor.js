"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCustomCursor = void 0;
// src/hooks/useCustomCursor.ts
var react_1 = require("react");
var useCustomCursor = function () {
    var _a = (0, react_1.useState)({ x: 0, y: 0 }), mousePos = _a[0], setMousePos = _a[1];
    var _b = (0, react_1.useState)("default"), cursorType = _b[0], setCursorType = _b[1];
    (0, react_1.useEffect)(function () {
        var mouseMove = function (e) {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        var mouseOver = function (e) {
            var target = e.target;
            // ✅ 개선된 판별 로직:
            // 1. 요소 자체가 버튼/링크 태그인 경우
            // 2. CSS 스타일이 cursor: pointer인 경우
            // 3. 부모 요소 중 'group' 또는 'cursor-pointer' 클래스를 가진 요소가 있는 경우 (.closest 사용)
            var isClickable = ['BUTTON', 'A', 'INPUT', 'SELECT'].includes(target.tagName) ||
                window.getComputedStyle(target).cursor === "pointer" ||
                target.closest('.group') !== null ||
                target.closest('.cursor-pointer') !== null;
            setCursorType(isClickable ? "hover" : "default");
        };
        window.addEventListener("mousemove", mouseMove);
        window.addEventListener("mouseover", mouseOver);
        return function () {
            window.removeEventListener("mousemove", mouseMove);
            window.removeEventListener("mouseover", mouseOver);
        };
    }, []);
    return { mousePos: mousePos, cursorType: cursorType };
};
exports.useCustomCursor = useCustomCursor;
