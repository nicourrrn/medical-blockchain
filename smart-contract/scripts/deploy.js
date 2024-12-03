const hre = require("hardhat");

async function main() {
  const InsuranceNFT = await ethers.getContractFactory("InsuranceNFT");
  const contract = await InsuranceNFT.deploy();
  console.log("Contract deployed to:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });