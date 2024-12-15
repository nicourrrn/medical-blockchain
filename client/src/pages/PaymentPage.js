import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
    Box,
    Container,
    Paper,
    Typography,
    Button,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    Divider
  } from "@mui/material";
import { useLocation } from "react-router-dom";
import InsuranceNFT from "./InsuranceNFT.json";
import apiService from "../services/apiService";


const PaymentPage = () => {
    const location = useLocation();
    const { premium: premiumUSD } = location.state || { premium: "10" }; // Default 10 USD

    const [status, setStatus] = useState("Connect your wallet to purchase insurance.");
    const [tokenId, setTokenId] = useState(null);
    const [contract, setContract] = useState(null);
    const [signer, setSigner] = useState(null);
    const [provider, setProvider] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const contractAddress = "0x0a21e8ddD6DBA8e28F62C6869f73712139C24b89";

    useEffect(() => {
        const init = async () => {
            try {
                setIsLoading(true);

                if (typeof window.ethereum === 'undefined') {
                    throw new Error("Please install MetaMask");
                }

                // Request account access
                await window.ethereum.request({ method: 'eth_requestAccounts' });

                // Setup provider
                const provider = new ethers.BrowserProvider(window.ethereum);
                if (!provider) {
                    throw new Error("Failed to initialize provider");
                }
                setProvider(provider);

                // Get signer
                const currentSigner = await provider.getSigner();
                if (!currentSigner) {
                    throw new Error("Failed to get signer");
                }
                setSigner(currentSigner);

                // Initialize contract
                if (!InsuranceNFT.abi) {
                    throw new Error("Contract ABI not found");
                }

                const insuranceContract = new ethers.Contract(
                    contractAddress,
                    InsuranceNFT.abi,
                    currentSigner
                );
                setContract(insuranceContract);
                setStatus("Wallet connected. Ready to purchase insurance.");

            } catch (error) {
                console.error("Initialization error:", error);
                setStatus("Error initializing contract: " + error.message);
            } finally {
                setIsLoading(false);
            }
        };

        init();

        // Cleanup
        return () => {
            setProvider(null);
            setSigner(null);
            setContract(null);
        };
    }, []);

    const uploadContractToServer = async ({ address }) => {
        try {
            // Create proper contract object to match server expectations
            const contractData = {
                address: contractAddress,         // Just the plain contract address
                tokenId: address.tokenId         // Token ID as separate field
            };

            await apiService.uploadContract(contractData);
            console.log("Contract uploaded successfully");
        } catch (error) {
            console.error("Error uploading contract:", error);
            throw error;
        }
    };

    const fetchEthPrice = async () => {
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
            const data = await response.json();
            return data.ethereum.usd;
        } catch (error) {
            console.error("Error fetching ETH price:", error);
            throw new Error("Could not fetch ETH price");
        }
    };

    const convertUSDtoETH = (usdAmount, ethPrice) => {
        // First divide USD by 1000 for testing
        const loweredUSD = parseFloat(usdAmount) / 1000;
        // Convert to ETH with fixed precision (6 decimal places)
        const ethAmount = (loweredUSD / ethPrice).toFixed(6);
        console.log("USD amount:", loweredUSD, "ETH amount:", ethAmount); // Debug
        return ethAmount;
    };


    const purchaseInsurance = async () => {
        try {
            if (!contract || !signer) {
                throw new Error("Please connect your wallet first");
            }

            setStatus("Initiating purchase...");
            const currentEthPrice = await fetchEthPrice();
            const premiumInEth = convertUSDtoETH(premiumUSD, currentEthPrice);

            const transaction = await contract.purchaseInsurance({
                value: ethers.parseEther(premiumInEth)
            });

            setStatus("Transaction pending... Please wait for confirmation");
            const receipt = await transaction.wait();

            console.log("Full receipt:", JSON.stringify(receipt, null, 2));

            if (!receipt.logs || receipt.logs.length === 0) {
                throw new Error("No logs found in transaction");
            }

            // Find Transfer event by topic (ERC721 Transfer event signature)
            const transferLog = receipt.logs.find(log =>
                log.topics[0] === "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
            );

            if (transferLog) {
                // TokenId is the fourth topic (index 3) in hex
                const tokenIdHex = transferLog.topics[3];
                const newTokenId = parseInt(tokenIdHex, 16).toString();

                setTokenId(newTokenId);
                await uploadContractToServer({
                    address: {
                        tokenId: newTokenId
                    }
                });
                setStatus(`Insurance purchased successfully! Token ID: ${newTokenId}`);
            } else {
                console.error("Available logs:", receipt.logs);
                throw new Error("Transfer log not found in transaction");
            }

        } catch (error) {
            console.error("Purchase error:", error);
            setStatus(`Transaction failed: ${error.message}`);
        }
    };

    return (
        <Container maxWidth="sm">
          <Box
            sx={{
              minHeight: '100vh',
              py: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
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
                  p: 3,
                  textAlign: 'center'
                }}
              >
                <Typography variant="h4" component="h1">
                  Purchase Insurance
                </Typography>
              </Box>
    
              <CardContent sx={{ p: 4 }}>
                {/* Status Messages */}
                {status && (
                  <Alert 
                    severity={
                      status.includes("successfully") ? "success" : 
                      status.includes("failed") ? "error" : 
                      status.includes("pending") ? "info" : 
                      "info"
                    }
                    sx={{ mb: 3 }}
                  >
                    {status}
                  </Alert>
                )}
    
                {/* Payment Details */}
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Payment Details
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      Premium Amount
                    </Typography>
                    <Typography variant="h4" color="primary" gutterBottom>
                      ${premiumUSD}
                    </Typography>
                  </CardContent>
                </Card>
    
                {/* Payment Button */}
                <Box sx={{ textAlign: 'center' }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={purchaseInsurance}
                    disabled={isLoading || !contract}
                    sx={{
                      minWidth: 200,
                      py: 1.5,
                      position: 'relative'
                    }}
                  >
                    {isLoading ? (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CircularProgress 
                          size={24} 
                          sx={{ 
                            color: 'white',
                            mr: 1 
                          }} 
                        />
                        Processing...
                      </Box>
                    ) : (
                      `Pay $${premiumUSD}`
                    )}
                  </Button>
                </Box>
    
                {/* Insurance Details */}
                {tokenId && (
                  <Card 
                    sx={{ 
                      mt: 3, 
                      bgcolor: 'success.light',
                      color: 'success.contrastText'
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Insurance Purchased Successfully!
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body1">
                        Your Insurance NFT Token ID: {tokenId}
                      </Typography>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Paper>
          </Box>
        </Container>
      );
};

export default PaymentPage;