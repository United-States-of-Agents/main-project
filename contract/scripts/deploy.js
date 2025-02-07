const hre = require("hardhat");
const NetworkStateModule = require("../ignition/modules/NetworkState.js");
const USATokenModule = require("../ignition/modules/USAToken.js");

async function main() {
    // Deploy USA Token
    const {token} = await hre.ignition.deploy(USATokenModule);

    // Fetch the Token Address
    const contractAddress = await token.getAddress();
    console.log(`USA Token deployed: ${contractAddress}`);

    if(contractAddress) {
        // Deploy Network State Contract
        const {networkState} = await hre.ignition.deploy(NetworkStateModule, {
            parameters: {NetworkStateModule: {contractAddress}}
        });
        console.log(`Network State Contract deployed: ${await networkState.getAddress()}`);
    }else{
        console.log("USA Token not found!");
    }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
      console.error(error);
      process.exit(1);
  });


// Deployment:
// npx hardhat run scripts/deploy.js --network baseSepolia

// Contract Verify:
// npx hardhat verify --network baseSepolia 0xCEa14b51d4E2811b7799fF29A6B6b532f5B27A87 0x2EF308295579A58E1B95cD045B7af2f9ec7931f8

// Deployments:
// USA Token deployed: 0x2EF308295579A58E1B95cD045B7af2f9ec7931f8

// Network State Contract deployed: 0xCEa14b51d4E2811b7799fF29A6B6b532f5B27A87
// https://sepolia.basescan.org/address/0xCEa14b51d4E2811b7799fF29A6B6b532f5B27A87#code