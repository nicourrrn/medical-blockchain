import React, { useState } from "react";
import { ethers } from "ethers";
import axios from "axios";

const WalletAuth = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState("");

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setError("MetaMask is not installed");
        return;
      }

      // Request access to MetaMask
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);

      // Prompt user to sign a message
      const message = "Authenticate with this signature.";
      const signature = await signer.signMessage(message);

      // Send signature to the server for authentication
      const response = await axios.post("http://127.0.0.1:8000/auth", {
        address,
        signature,
      });

      if (response.data.message === "Authenticated") {
        setAuthenticated(true);
      } else {
        setError("Authentication failed");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Wallet Authentication</h1>
      {!authenticated ? (
        <div>
          <p>Connect your wallet to authenticate</p>
          <button onClick={connectWallet} style={{ padding: "10px 20px" }}>
            Connect Wallet
          </button>
          {walletAddress && <p>Wallet Address: {walletAddress}</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      ) : (
        <div>
          <h2>Authentication Successful</h2>
          <p>Welcome, {walletAddress}!</p>
        </div>
      )}
    </div>
  );
};

export default WalletAuth;
