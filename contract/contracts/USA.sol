// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract USA is ERC20 {
    constructor() ERC20("United States of Agents", "USA") {
        _mint(msg.sender, 10000000000 * (10 ** uint256(decimals())));
    }
}