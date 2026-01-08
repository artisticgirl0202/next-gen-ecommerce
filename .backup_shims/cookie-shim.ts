import cookie from 'cookie';

// Provide named exports (parse, serialize) that some ESM consumers expect
export const parse = (cookie as any).parse;
export const serialize = (cookie as any).serialize;

export default cookie;
