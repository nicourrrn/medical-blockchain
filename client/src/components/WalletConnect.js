import React, { useState } from "react";
import { BrowserProvider } from "ethers";
import { keccak256, toUtf8Bytes, getBytes } from "ethers";
import apiService from "../services/apiService";
import { Box, Button, Typography, Alert } from "@mui/material";

const WalletConnect = ({ onWalletConnected }) => {
  const [walletAddress, setWalletAddress] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState("");

  const checkUserContract = async (address) => {
    try {
      const userInfo = await apiService.getUserInfo();
      console.log("Full user info:", JSON.stringify(userInfo, null, 2));

      if (userInfo.user && userInfo.user.contract) {
        let contractData = userInfo.user.contract;
        console.log("Contract data (initial):", contractData);

        if (typeof contractData === 'object' && contractData !== null) {
          console.log("Contract object properties:", Object.keys(contractData));

          // Check for both address and tokenId directly
          if (contractData.address && contractData.tokenId) {
            console.log("Token ID found:", contractData.tokenId);
            onWalletConnected(address, true, {
              hasContract: true,
              tokenId: contractData.tokenId,
              contractAddress: contractData.address
            });
          } else {
            console.log("Missing address or tokenId in contract data");
            onWalletConnected(address, true, { hasContract: false });
          }
        } else {
          console.log("Contract data is not a valid object:", contractData);
          onWalletConnected(address, true, { hasContract: false });
        }
      } else {
        console.log("No contract found in user data");
        onWalletConnected(address, true, { hasContract: false });
      }
    } catch (error) {
      console.error("Error checking user contract:", error);
      onWalletConnected(address, true, { hasContract: false });
    }
  };

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
        onWalletConnected(address, true);
        await checkUserContract(address); // Notify parent component of successful authentication
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
