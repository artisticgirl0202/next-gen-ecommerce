declare module 'set-cookie-parser' {
  const _default: {
    parse: (input: any, options?: any) => any;
    parseString: (str: string, options?: any) => any;
    splitCookiesString: (str: string | string[]) => string[];
    [key: string]: any;
  };
  export default _default;
  export function parse(input: any, options?: any): any;
  export function parseString(str: string, options?: any): any;
  export function splitCookiesString(str: string | string[]): string[];
}
