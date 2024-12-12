import './App.css';
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import InsuranceFormPage from "./pages/InsuranceFormPage";
import PaymentPage from './pages/PaymentPage';

const App = () => {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<RegisterPage />} />
      <Route path="/insurance-form" element={<InsuranceFormPage />} />
      <Route path="/payment" element={<PaymentPage />} />
      </Routes>
    </Router>
  );
};

export default App;


