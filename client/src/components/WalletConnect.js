import React, { useState } from "react";
import { BrowserProvider } from "ethers";
import { keccak256, toUtf8Bytes, getBytes } from "ethers";
import axios from "axios";

const WalletConnect = ({ onWalletConnected }) => {
    const [walletAddress, setWalletAddress] = useState("");
    const [authenticated, setAuthenticated] = useState(false);
    const [error, setError] = useState("");
    const [nonce, setNonce] = useState("");
    
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setError("MetaMask is not installed");
        return;
      }

      const provider = new BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);
      onWalletConnected(address);
      // Fetch the nonce for this wallet address
      const nonceResponse = await axios.get(`http://127.0.0.1:8000/auth/nonce/${address}`);
      setNonce(nonceResponse.data.nonce);

      // Sign the nonce
      const message = `Login request: ${nonceResponse.data.nonce}`;
      const messageHash = keccak256(toUtf8Bytes(message));
    const signature = await signer.signMessage(getBytes(messageHash));


    console.log("Message:", message);
    console.log("Signature:", signature);

      // Verify the signature on the server
      const verificationResponse = await axios.post("http://127.0.0.1:8000/auth/verify", {
        address,
        signature,
      });

      if (verificationResponse.data.message === "Login successful") {
        setAuthenticated(true);
      } else {
        setError("Authentication failed");
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "An error occurred");
    }
  };

  return (
    <div>
      {walletAddress ? (
        <p>Connected: {walletAddress}</p>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
};

export default WalletConnect;