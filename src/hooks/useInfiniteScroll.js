"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useInfiniteScroll = useInfiniteScroll;
// src/hooks/useInfiniteScroll.ts
var react_1 = require("react");
function useInfiniteScroll(onIntersect, options) {
    var ref = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(function () {
        var el = ref.current;
        if (!el)
            return;
        var obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    onIntersect();
                }
            });
        }, options !== null && options !== void 0 ? options : { root: null, rootMargin: "300px", threshold: 0.1 });
        obs.observe(el);
        return function () { return obs.disconnect(); };
    }, [onIntersect, options]);
    return ref;
}
