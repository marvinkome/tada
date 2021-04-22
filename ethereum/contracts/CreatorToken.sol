// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import "./BondingCurve.sol";

contract CreatorToken is BancorBondingCurve, ERC20 {
  using SafeMath for uint256;

  uint256 scale = 10**18;
  uint256 reserveBalance = 10 * scale;
  uint256 reserveRatio;
  ERC20 platformToken;

  /**
   * @dev creates a BondingCurve ERC20 token and gives the creator of the contract the initial supply (1)
   *
   * @param name_                 name of the token
   * @param symbol_               symbol of the token
   * @param reserveRatio_         reserve ratio, represented in ppm, 1-1000000
   * @param platformTokenAddress_ address of the platformToken
   */
  constructor(
    string memory name_,
    string memory symbol_,
    uint256 reserveRatio_,
    ERC20 platformTokenAddress_
  ) ERC20(name_, symbol_) {
    platformToken = platformTokenAddress_;
    reserveRatio = reserveRatio_;
    _mint(msg.sender, 1 * scale);
  }

  modifier platformPayable(uint256 _amount) {
    require(
      platformToken.transferFrom(msg.sender, address(this), _amount),
      "Must send Shill to buy tokens."
    );
    _;
  }

  function buy(uint256 _amount) public platformPayable(_amount) {
    require(_amount > 0, "Must send Shill to buy tokens.");
    _continuousMint(_amount);
  }

  function sell(uint256 _amount) public {
    uint256 returnAmount = _continuousBurn(_amount);
    platformToken.transfer(msg.sender, returnAmount);
  }

  function calculateBuyPrice(uint256 _amount) public view returns (uint256 mintAmount) {
    return calculatePurchaseReturn(totalSupply(), reserveBalance, uint32(reserveRatio), _amount);
  }

  function calculateSellPrice(uint256 _amount) public view returns (uint256 burnAmount) {
    return calculateSaleReturn(totalSupply(), reserveBalance, uint32(reserveRatio), _amount);
  }

  function _continuousMint(uint256 _deposit) internal returns (uint256) {
    require(_deposit > 0, "Deposit must be non-zero.");
    uint256 amount = calculateBuyPrice(_deposit);

    _mint(msg.sender, amount);

    reserveBalance = reserveBalance.add(_deposit);
    return amount;
  }

  function _continuousBurn(uint256 _amount) internal returns (uint256) {
    require(_amount > 0, "Amount must be non-zero.");
    require(balanceOf(msg.sender) >= _amount, "Insufficient tokens to burn.");

    uint256 reimburseAmount = calculateSellPrice(_amount);
    reserveBalance = reserveBalance.sub(reimburseAmount);

    _burn(msg.sender, _amount);
    return reimburseAmount;
  }
}
