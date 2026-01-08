import scp from 'set-cookie-parser';

export const splitCookiesString = (scp as any).splitCookiesString;
export const parse = (scp as any).parse;
export const parseString = (scp as any).parseString;

export default scp;
