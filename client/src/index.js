import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Setup } from "./Setup";
import { Form } from "./Form";
import { Join } from "./Join";
// import 'bootstrap/dist/css/bootstrap.min.css';
// import { Verifier } from "./Verifier";
// import { Prover } from "./Prover";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" Component={App} /> {/* 👈 Renders at /app/ */}
        <Route path="/setup/:messenger" Component={Setup} />
        <Route path="/form/:token" Component={Form} />
        <Route path="/join/:groupId" Component={Join} />
        {/* <Route path="/verifier/:checkId" Component={Verifier} />
        <Route path="/prover/:checkId" Component={Prover} /> */}
      </Routes>
    </BrowserRouter>
  // </React.StrictMode>
);
