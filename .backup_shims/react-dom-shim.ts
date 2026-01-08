import * as ReactDOMCJS from 'react-dom-original';
const ReactDOM = (ReactDOMCJS as any).default || ReactDOMCJS;

export const flushSync = (ReactDOM as any).flushSync;
export default ReactDOM;
