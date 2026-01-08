import * as ReactCJS from 'react-original';
const React = (ReactCJS as any).default || ReactCJS;

// Re-export commonly used React APIs as named exports so Rollup can statically analyze them.
export const createElement = (React as any).createElement;
export const Fragment = (React as any).Fragment;
export const Component = (React as any).Component;
export const Children = (React as any).Children;
export const isValidElement = (React as any).isValidElement;
export const cloneElement = (React as any).cloneElement;
export function createContext(...args: any[]) { return (React as any).createContext(...args); }
export const useContext = (React as any).useContext;
export const useState = (React as any).useState;
export const useEffect = (React as any).useEffect;
export const useLayoutEffect = (React as any).useLayoutEffect;
export const useRef = (React as any).useRef;
export const useMemo = (React as any).useMemo;
export const useCallback = (React as any).useCallback;
export const useId = (React as any).useId;
export const forwardRef = (React as any).forwardRef;
export const memo = (React as any).memo;
export const startTransition = (React as any).startTransition;
export const Suspense = (React as any).Suspense;
export const useSyncExternalStore = (React as any).useSyncExternalStore;
export const useDeferredValue = (React as any).useDeferredValue;
export const useInsertionEffect = (React as any).useInsertionEffect;

export default React;
