import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import InsuranceNFT from "./InsuranceNFT.json";


const PaymentPage = () => {
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
    // Add this before the return statement
const purchaseInsurance = async () => {
    try {
        if (!contract || !signer) {
            throw new Error("Please connect your wallet first");
        }

        setStatus("Initiating purchase...");
        
        const premium = ethers.parseEther("0.01"); // 0.01 ETH premium

        const transaction = await contract.purchaseInsurance({
            value: premium
        });

        setStatus("Transaction pending... Please wait for confirmation");
        
        const receipt = await transaction.wait();
        
        const purchaseEvent = receipt.events?.find(
            (event) => event.event === "InsurancePurchased"
        );
        
        if (purchaseEvent) {
            const newTokenId = purchaseEvent.args?.tokenId.toString();
            setTokenId(newTokenId);
            setStatus(`Insurance purchased successfully! Token ID: ${newTokenId}`);
        } else {
            throw new Error("Purchase event not found in transaction");
        }
        
    } catch (error) {
        console.error("Purchase error:", error);
        setStatus(`Transaction failed: ${error.message}`);
    }
};
    return (
        <div>
            <h2>Purchase Insurance</h2>
            <p>{status}</p>
            <button 
                onClick={purchaseInsurance} 
                disabled={isLoading || !contract}
            >
                {isLoading ? "Loading..." : "Buy Insurance"}
            </button>
            {tokenId && <p>Your NFT Token ID: {tokenId}</p>}
        </div>
    );
};

export default PaymentPage;