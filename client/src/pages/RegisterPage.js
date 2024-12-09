import React, { useState } from "react";
import WalletConnect from "../components/WalletConnect";
import { Box, Typography, Container } from "@mui/material";

const RegisterPage = () => {
  const [walletAddress, setWalletAddress] = useState("");

  const handleWalletConnected = (address) => {
    setWalletAddress(address);
    console.log("Wallet connected:", address);
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          textAlign: "center",
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom>
          Connect Your Wallet
        </Typography>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          To proceed with our insurance platform, connect your wallet to verify
          your identity securely.
        </Typography>
        <WalletConnect onWalletConnected={handleWalletConnected} />
        {walletAddress && (
          <Typography variant="body2" color="textPrimary" mt={2}>
            Connected Wallet: {walletAddress}
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default RegisterPage;
