import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  CircularProgress,
  Container,
  Divider,
  Paper
} from "@mui/material";
import "./RegisterPage.css";
import WalletConnect from "../components/WalletConnect";

const RegisterPage = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [insuranceId, setInsuranceId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [contractAddress, setContractAddress] = useState(null);
  const firstCallRef = useRef(true);
  const navigate = useNavigate();

  const handleWalletConnected = async (address, isAuthenticated, userState) => {
    console.log("handleWalletConnected called:", { 
      address, 
      isAuthenticated, 
      userState,
      firstCall: firstCallRef.current 
    });

    if (!firstCallRef.current) {
      console.log("Ignoring subsequent call");
      return;
    }

    try {
      setIsLoading(true);
      setWalletAddress(address);

      if (!isAuthenticated) {
        console.log("Not authenticated");
        return;
      }

      // Only proceed with first call that has userState
      if (userState?.hasContract && userState?.tokenId) {
        console.log("Processing insurance data:", userState);
        firstCallRef.current = false;
        setInsuranceId(userState.tokenId);
        setContractAddress(userState.contractAddress);
        setAuthenticated(true);
      } else if (userState !== undefined) {
        // Only navigate if we explicitly know there's no insurance
        console.log("No insurance found, navigating to form");
        firstCallRef.current = false;
        navigate("/insurance-form");
      }

    } catch (error) {
      console.error("Connection error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4
        }}
      >
        <Paper 
          elevation={3}
          sx={{
            width: '100%',
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              p: 2,
              textAlign: 'center'
            }}
          >
            <Typography variant="h4" component="h1">
              Authentication
            </Typography>
          </Box>

          <CardContent sx={{ p: 3 }}>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  Please sign message in your wallet
                </Typography>
                <Box sx={{ my: 3 }}>
                  <WalletConnect onWalletConnected={handleWalletConnected} />
                </Box>
              </Box>
            )}

            {authenticated && insuranceId && (
              <Card 
                variant="outlined" 
                sx={{ 
                  mt: 3,
                  bgcolor: 'success.light',
                  color: 'success.contrastText'
                }}
              >
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Congratulations! You are already insured
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6">
                    Your Insurance Details
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body1">
                      Insurance Token ID: {insuranceId}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        mt: 1,
                        wordBreak: 'break-all'
                      }}
                    >
                      Contract Address: {contractAddress}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterPage;