const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("NetworkStateModule", (m) => {       
    // Get the ERC-20 Contract Address
    const contractAddress = m.getParameter("contractAddress");
    
    // Deploy the Contract
    const networkState = m.contract("NetworkState", [contractAddress]);

    return { networkState };
});