const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("USATokenModule", (m) => {       
    
    // Deploy the Contract
    const token = m.contract("USA", []);

    return { token };
});