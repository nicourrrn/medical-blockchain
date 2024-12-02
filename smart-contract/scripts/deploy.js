const hre = require("hardhat");

async function main() {
  const InsuranceNFT = await hre.ethers.getContractFactory("InsuranceNFT");
  const contract = await InsuranceNFT.deploy();
  await contract.deployed();

  console.log("Contract deployed to:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
