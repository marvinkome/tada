// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma abicoder v2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./CreatorToken.sol";

contract TaDa is Ownable {
  struct Creator {
    address creatorToken;
    string tokenSymbol;
    string tokenName;
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

  function faucetToken(address user, string memory userId) public onlyOwner {
    require(!hasFaucetUserId[userId], "User signed up already");
    require(!hasFaucetAddress[user], "User signed up already");

    token.transfer(user, 50 * scale);

    hasFaucetUserId[userId] = true;
    hasFaucetAddress[user] = true;
  }

  function makeCreatorToken(string memory name_, string memory symbol_) public onlyOwner {
    Creator memory newCreator =
      Creator({
        creatorToken: address(new CreatorToken(name_, symbol_, reserveRatio, token)),
        tokenSymbol: symbol_,
        tokenName: name_
      });

    creators.push(newCreator);
  }

  function getCreatorToken() public view returns (Creator[] memory) {
    return creators;
  }
}
