import './App.css';
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import InsuranceFormPage from "./pages/InsuranceFormPage";

const App = () => {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<RegisterPage />} />
      <Route path="/insurance-form" element={<InsuranceFormPage />} />
      </Routes>
    </Router>
  );
};

export default App;


