"use strict";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
// import React from "react"
// import ReactDOM from "react-dom/client"
// import App from "./App"
// import "./index.css"
Object.defineProperty(exports, "__esModule", { value: true });
// const queryClient = new QueryClient()
// ReactDOM.createRoot(
//   document.getElementById("root")!
// ).render(
//   <React.StrictMode>
//     <QueryClientProvider client={queryClient}>
//       <App />
//     </QueryClientProvider>
//   </React.StrictMode>
// )
// src/main.tsx (or root file)
var react_query_1 = require("@tanstack/react-query");
var react_1 = require("react");
var client_1 = require("react-dom/client");
var App_1 = require("./App");
require("./index.css");
var queryClient = new react_query_1.QueryClient();
client_1.default.createRoot(document.getElementById("root")).render(<react_1.default.StrictMode>
    <react_query_1.QueryClientProvider client={queryClient}>

      <App_1.default />

    </react_query_1.QueryClientProvider>
  </react_1.default.StrictMode>);
