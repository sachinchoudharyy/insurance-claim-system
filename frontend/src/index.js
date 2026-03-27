import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/global.css";
import { BrowserRouter } from "react-router-dom";   // ✅ ADD

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>   {/* ✅ REQUIRED */}
    <App />
  </BrowserRouter>
);