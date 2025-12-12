import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FirstPage from "./pages/FirstPage"; // CHANGED
import SignInPage from "./pages/SignInPage";
import HomePage from "./HomePage";

const RootRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FirstPage />} /> {/* CHANGED */}
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/home" element={<HomePage />} />
      </Routes>
    </Router>
  );
};

export default RootRouter;