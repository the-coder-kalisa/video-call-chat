import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App";
import Signup from "./Signup";
import Continue from "./Continue";
import { RecoilRoot } from "recoil";
import Login from "./Login";
import Chat from "./ Chat";
import Notfound from "./Notfound";
import Logout from "./Logout";
import Forgot from "./Forgot";
import Profile from "./Profile";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <RecoilRoot>
    <React.StrictMode>
      <Router>
        <Routes>
          <Route element={<App />} path="/" />
          <Route element={<Signup />} path="/signup" />
          <Route element={<Continue />} path="/signup/continue" />
          <Route element={<Login />} path="/login" />
          <Route element={<Notfound />} path="*" />
          <Route element={<Chat />} path="/chat" />
          <Route element={<Logout />} path="/logout" />
          <Route element={<Forgot />} path="/forgot" />
          <Route element={<Profile />} path="/profile/:username" />
        </Routes>
      </Router>
    </React.StrictMode>
  </RecoilRoot>
);
