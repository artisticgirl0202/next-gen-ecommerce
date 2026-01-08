import * as ReactDOMClientCJS from 'react-dom-client-original';
const ReactDOMClient = (ReactDOMClientCJS as any).default || ReactDOMClientCJS;

export default ReactDOMClient;
export const createRoot = (ReactDOMClient as any).createRoot;
export const hydrateRoot = (ReactDOMClient as any).hydrateRoot;
