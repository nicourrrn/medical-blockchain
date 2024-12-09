import './App.css';
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import WalletConnect from "./components/WalletConnect";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RegisterPage />} />
      </Routes>
    </Router>
  );
};

export default App;


