import React, { useState } from "react";
import { BrowserProvider } from "ethers";
import { keccak256, toUtf8Bytes, getBytes } from "ethers";
import apiService from "../services/apiService";
import { Box, Button, Typography, Alert } from "@mui/material";

const WalletConnect = ({ onWalletConnected }) => {
  const [walletAddress, setWalletAddress] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState("");

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

      // Fetch the nonce for this wallet address
      const { nonce } = await apiService.getNonce(address);

      // Sign the nonce
      const message = `Login request: ${nonce}`;
      const messageHash = keccak256(toUtf8Bytes(message));
      const signature = await signer.signMessage(getBytes(messageHash));

      // Verify the signature on the server
      const { token } = await apiService.verifySignature({
        address,
        signature,
      });
    
      if (token) {
        setAuthenticated(true);
        localStorage.setItem("token", token); // Save token in localStorage
        onWalletConnected(address, true); // Notify parent component of successful authentication
      } else {
        setError("Authentication failed");
        onWalletConnected(address, false); // Notify parent component of failed authentication
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "An error occurred");
      onWalletConnected(walletAddress, false); // Notify parent component of failed authentication
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        mt: 4,
      }}
    >
      {walletAddress ? (
        <Typography variant="h6" color="primary">
          Connected: {walletAddress}
        </Typography>
      ) : (
        <Button variant="contained" color="primary" onClick={connectWallet}>
          Connect Wallet
        </Button>
      )}

      {authenticated && <Alert severity="success">Authenticated!</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
    </Box>
  );
};

export default WalletConnect;
