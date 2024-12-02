const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("InsuranceNFT Contract", function () {
  let InsuranceNFT, contract, owner, addr1;

    beforeEach(async function () {
        InsuranceNFT = await ethers.getContractFactory("InsuranceNFT");
        [owner, addr1] = await ethers.getSigners();
        contract = await InsuranceNFT.deploy();
        await contract.waitForDeployment(); 
        });

        it("Should allow a user to purchase insurance", async function () {
            const premium = ethers.parseEther("0.1");
            await contract.connect(addr1).purchaseInsurance({ value: premium });
            expect(await contract.insuredUsers(addr1.address)).to.equal(true);
        });


        it("Should not allow a user to purchase twice", async function () {
            const premium = ethers.parseEther("0.1");

            await contract.connect(addr1).purchaseInsurance({ value: premium });

            await expect(
            contract.connect(addr1).purchaseInsurance({ value: premium })
            ).to.be.revertedWith("Already insured");
        });

        it("Should allow the owner to withdraw funds", async function () {
            const premium = ethers.parseEther("0.1");
            await contract.connect(addr1).purchaseInsurance({ value: premium });
          
            const initialOwnerBalance = await ethers.provider.getBalance(owner.address);
        
            const tx = await contract.connect(owner).withdrawFunds();
            const receipt = await tx.wait();
          
            if (!receipt) {
                throw new Error("Transaction receipt is undefined");
            }
        
            const gasUsed = receipt.gasUsed;
            const gasPrice = receipt.effectiveGasPrice || receipt.gasPrice;
          
            if (!gasUsed || !gasPrice) {
                throw new Error("Gas information is missing from the receipt");
            }
        
            const gasCost = gasUsed * gasPrice; 
            const finalOwnerBalance = await ethers.provider.getBalance(owner.address); 
          
            const expectedBalance = initialOwnerBalance + BigInt(premium) - gasCost;
        
            expect(finalOwnerBalance).to.equal(expectedBalance);
        });
        
        
   

        it("Should not allow non-owner to withdraw funds", async function () {
            await expect(contract.connect(addr1).withdrawFunds()).to.be.revertedWithCustomError(
              contract,
              "OwnableUnauthorizedAccount"
            );
        });
          
          

        it("Should correctly store premium for each token", async function () {
            const premium = ethers.parseEther("0.1");

            await contract.connect(addr1).purchaseInsurance({ value: premium });

            const tokenId = 1; // First token
            expect(await contract.tokenToPremium(tokenId)).to.equal(premium);
        });
});