const hre = require("hardhat");

async function main() {
    const tokenAddress = "0xYourERC20TokenAddress"; // Replace with actual token address

    console.log("Deploying AgentReviewSystem...");
    const AgentReviewSystem = await hre.ethers.getContractFactory("AgentReviewSystem");
    const contract = await AgentReviewSystem.deploy(tokenAddress);

    await contract.deployed();
    console.log(`Contract deployed to: ${contract.address}`);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
      console.error(error);
      process.exit(1);
  });