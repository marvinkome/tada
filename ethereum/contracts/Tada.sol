// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./CreatorToken.sol";

contract TaDa {
  struct Creator {
    address creatorToken;
    string tokenSymbol;
  }

  mapping(string => bool) public hasFaucetUserId;
  mapping(address => bool) public hasFaucetAddress;

  uint256 reserveRatio = 800000; // 90%
  uint256 scale = 10**18;

  ERC20 public token;
  Creator[] public creators;

  constructor(ERC20 _tokenAddress) {
    token = _tokenAddress;
  }

  function faucetToken(string memory userId) public {
    require(!hasFaucetUserId[userId], "User signed up already");
    require(!hasFaucetAddress[msg.sender], "User signed up already");

    token.transfer(msg.sender, 50 * scale);

    hasFaucetUserId[userId] = true;
    hasFaucetAddress[msg.sender] = true;
  }

  function makeCreatorToken(string memory name_, string memory symbol_) public {
    Creator memory newCreator =
      Creator({
        creatorToken: address(new CreatorToken(name_, symbol_, reserveRatio, token)),
        tokenSymbol: symbol_
      });

    creators.push(newCreator);
  }

  function getCreatorTokenCount() public view returns (uint256) {
    return creators.length;
  }
}
