const { expect } = require("chai");

describe("InsuranceNFT Contract", function () {
  let InsuranceNFT, contract, owner, addr1, addr2;

  beforeEach(async function () {
    InsuranceNFT = await ethers.getContractFactory("InsuranceNFT");
    [owner, addr1, addr2] = await ethers.getSigners();
    contract = await InsuranceNFT.deploy();
    await contract.deployed();
  });

  it("Should allow a user to purchase insurance", async function () {
    const premium = ethers.utils.parseEther("0.1");

    await contract.connect(addr1).purchaseInsurance({ value: premium });

    expect(await contract.insuredUsers(addr1.address)).to.equal(true);
    expect(await ethers.provider.getBalance(contract.address)).to.equal(premium);
  });

  it("Should not allow a user to purchase twice", async function () {
    const premium = ethers.utils.parseEther("0.1");

    await contract.connect(addr1).purchaseInsurance({ value: premium });

    await expect(
      contract.connect(addr1).purchaseInsurance({ value: premium })
    ).to.be.revertedWith("Already insured");
  });

  it("Should allow the owner to withdraw funds", async function () {
    const premium = ethers.utils.parseEther("0.1");

    await contract.connect(addr1).purchaseInsurance({ value: premium });

    const initialOwnerBalance = await ethers.provider.getBalance(owner.address);

    const tx = await contract.connect(owner).withdrawFunds();
    const receipt = await tx.wait();

    const gasCost = receipt.gasUsed.mul(receipt.effectiveGasPrice);
    const finalOwnerBalance = await ethers.provider.getBalance(owner.address);

    expect(finalOwnerBalance).to.equal(initialOwnerBalance.add(premium).sub(gasCost));
  });

  it("Should not allow non-owner to withdraw funds", async function () {
    await expect(contract.connect(addr1).withdrawFunds()).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Should correctly store premium for each token", async function () {
    const premium = ethers.utils.parseEther("0.1");

    await contract.connect(addr1).purchaseInsurance({ value: premium });

    const tokenId = 1; // First token
    expect(await contract.tokenToPremium(tokenId)).to.equal(premium);
  });
});
