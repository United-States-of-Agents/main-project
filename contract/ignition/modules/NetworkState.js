const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("NetworkStateModule", (m) => {       
    // Deploy the Contract
    const networkState = m.contract("NetworkState", [unlockTime]);

    return { networkState };
});

// Deployment Guide:
// npx hardhat ignition deploy ignition/modules/NetworkState.js --network localhost