import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RegisterPage.css";
import WalletConnect from "../components/WalletConnect";

const RegisterPage = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();

  const handleWalletConnected = (address, isAuthenticated) => {
    setWalletAddress(address);
    if (isAuthenticated) {
      // Redirect only after successful authentication
      navigate("/insurance-form");
    }
  };

  return (
    <div className="center-container">
        <h1>Authentication</h1>
        <h2>Please sign message in your wallet</h2>
        <WalletConnect onWalletConnected={handleWalletConnected} />
        {walletAddress && <p>Connected: {walletAddress}</p>}
    </div>
  );
};

export default RegisterPage;
