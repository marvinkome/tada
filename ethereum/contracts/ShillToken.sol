// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ShillToken is ERC20 {
  constructor(uint256 initialSupply) ERC20("Shill", "SHL") {
    _mint(msg.sender, initialSupply);
  }
}
