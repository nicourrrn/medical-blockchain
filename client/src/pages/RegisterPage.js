import React, { useState } from "react";
import WalletConnect from "../components/WalletConnect";
import InsuranceForm from "../components/InsuranceForm";

const RegisterPage = () => {
  const [walletAddress, setWalletAddress] = useState("");

  return (
    <div>
      <h1>Insurance Registration</h1>
      <WalletConnect onWalletConnected={setWalletAddress} />
      {walletAddress && <InsuranceForm walletAddress={walletAddress} />}
    </div>
  );
};

export default RegisterPage;
