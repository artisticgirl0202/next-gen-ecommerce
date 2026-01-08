import * as runtime from 'react-original/jsx-runtime';

export const jsx = (runtime as any).jsx;
export const jsxs = (runtime as any).jsxs;
export const Fragment = (runtime as any).Fragment;

// Intentionally do NOT export a default to avoid introducing a circular alias in the bundle.
