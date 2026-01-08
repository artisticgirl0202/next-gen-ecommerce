declare module 'react-dom-original' {
  const ReactDOM: any;
  export default ReactDOM;
  export const flushSync: any;
}

declare module 'react-dom-client-original' {
  const ReactDOMClient: any;
  export default ReactDOMClient;
  export const createRoot: any;
  export const hydrateRoot: any;
}
