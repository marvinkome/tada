import { expect } from "./setup"
import { ethers } from "hardhat"
import { Contract, Signer, BigNumber } from "ethers"

function convertPriceToEth(price: BigNumber) {
  let ethPrice = price.toString()
  return ethers.utils.formatEther(ethPrice).toString()
}

describe("Tada!", () => {
  const initialSupply = "5000"
  let account1: Signer
  let account2: Signer
  let account3: Signer

  let ShillToken: Contract
  let TadaContract: Contract

  const googleId1 = "105809056115901676361"
  const googleId2 = "105806056115901676362"
  const googleId3 = "105805056115901676363"

  before(async () => {
    ;[account1, account2, account3] = await ethers.getSigners()
  })

  beforeEach(async () => {
    // create shill tokens
    ShillToken = await (await ethers.getContractFactory("ShillToken"))
      .connect(account1)
      .deploy(ethers.utils.parseEther(initialSupply))

    // create main contract
    TadaContract = await (await ethers.getContractFactory("TaDa"))
      .connect(account1)
      .deploy(ShillToken.address)

    // send money to main contract
    await ShillToken.connect(account1).transfer(
      TadaContract.address,
      ethers.utils.parseEther(initialSupply)
    )
  })

  describe("Deploy", () => {
    it("deploys all tokens and contracts", async () => {
      expect(ShillToken.address).to.exist
      expect(TadaContract.address).to.exist
      expect(await TadaContract.token()).to.equal(ShillToken.address)
    })

    it("TaDa contract has correct balance", async () => {
      const tokenBalance = (await ShillToken.balanceOf(TadaContract.address)).toString()
      expect(tokenBalance).to.eq(ethers.utils.parseEther(initialSupply))
    })
  })

  describe("Token Transfer", () => {
    it("should transfer token to user", async () => {
      const receiverAddress = await account2.getAddress()

      await TadaContract.connect(account1).faucetToken(receiverAddress, googleId1)
      const receiverBalance = (await ShillToken.balanceOf(receiverAddress)).toString()

      expect(receiverBalance).to.eq(ethers.utils.parseEther("50"))
    })

    it("should revert when requesting token twice", async () => {
      const receiverAddress = await account2.getAddress()
      const secondReceiverAddress = await account3.getAddress()

      await TadaContract.connect(account1).faucetToken(receiverAddress, googleId1)

      await expect(
        TadaContract.connect(account1).faucetToken(receiverAddress, googleId1)
      ).to.be.revertedWith("User signed up already")

      await expect(
        TadaContract.connect(account1).faucetToken(receiverAddress, googleId2)
      ).to.be.revertedWith("User signed up already")

      await expect(
        TadaContract.connect(account1).faucetToken(secondReceiverAddress, googleId1)
      ).to.be.revertedWith("User signed up already")
    })
  })

  describe("Interact with Creators", () => {
    let CreatorToken: Contract

    beforeEach(async () => {
      await TadaContract.makeCreatorToken("Mark Rober", "MKR")
      const { creatorToken } = await TadaContract.creators(0)
      CreatorToken = await ethers.getContractAt("CreatorToken", creatorToken)
    })

    it("creates creator token", async () => {
      expect(CreatorToken.address).to.exist
    })

    it("TaDa contract has correct balance", async () => {
      const tokenBalance = (await CreatorToken.balanceOf(TadaContract.address)).toString()
      expect(tokenBalance).to.eq(ethers.utils.parseEther("1"))
    })

    it("can estimate price for token", async () => {
      // get estimated price
      let estimatedPrice = await CreatorToken.estimateBuyPrice(ethers.utils.parseEther("1"))
      let buyPrice = await CreatorToken.calculateBuyPrice(estimatedPrice)

      expect(buyPrice.gte(ethers.utils.parseEther("1"))).to.be.true
      expect(buyPrice.lt(ethers.utils.parseEther("1.1"))).to.be.true
    })

    it("user can buy creator tokens", async () => {
      // faucet user account
      const receiver = account2
      const receiverAddress = await account2.getAddress()
      await TadaContract.connect(account1).faucetToken(receiverAddress, googleId1)

      // buy 10 SHILL worth of creator tokens
      await ShillToken.connect(receiver).approve(
        CreatorToken.address,
        ethers.utils.parseEther("10")
      )
      await CreatorToken.connect(receiver).buy(ethers.utils.parseEther("10"))

      // expect user to buy more than 1 creator tokens with 10 SHILL tokens
      let balanceOfReceiver = await CreatorToken.balanceOf(receiverAddress)
      expect(balanceOfReceiver.gte(ethers.utils.parseEther("1"))).to.be.true
    })

    it("user can sell creator tokens", async () => {
      // faucet user account
      const receiver = account2
      const receiverAddress = await account2.getAddress()
      await TadaContract.connect(account1).faucetToken(receiverAddress, googleId1)

      // buy 10 SHILL worth of creator tokens
      await ShillToken.connect(receiver).approve(
        CreatorToken.address,
        ethers.utils.parseEther("10")
      )
      await CreatorToken.connect(receiver).buy(ethers.utils.parseEther("10"))

      // sell 1 creator token
      await CreatorToken.connect(receiver).sell(ethers.utils.parseEther("1"))

      // expect user new balance to be less or equal initial value
      let balanceOfReceiver = await ShillToken.balanceOf(receiverAddress)
      expect(balanceOfReceiver.lte(ethers.utils.parseEther("50"))).to.be.true
    })

    it("creator token price changes when you buy token", async () => {
      // faucet user account
      const receiver = account2
      const receiverAddress = await account2.getAddress()
      await TadaContract.connect(account1).faucetToken(receiverAddress, googleId1)

      // price of selling 1 creator token
      let initSellPrice = await CreatorToken.calculateSellPrice(ethers.utils.parseEther("1"))

      // price of buying 5 creator token
      let initBuyPrice = await CreatorToken.calculateBuyPrice(ethers.utils.parseEther("5"))

      expect(initSellPrice.gt(initBuyPrice)).to.be.true

      // user buys 10 creator token
      await ShillToken.connect(receiver).approve(
        CreatorToken.address,
        ethers.utils.parseEther("10")
      )
      await CreatorToken.connect(receiver).buy(ethers.utils.parseEther("10"))

      let newSellPrice = await CreatorToken.calculateSellPrice(ethers.utils.parseEther("1"))
      let newBuyPrice = await CreatorToken.calculateBuyPrice(ethers.utils.parseEther("5"))

      expect(newSellPrice.gt(initSellPrice)).to.be.true
      expect(newBuyPrice.lt(initBuyPrice)).to.be.true

      // user sells some creator tokens
      await CreatorToken.connect(receiver).sell(ethers.utils.parseEther("1"))

      let afterNewSellPrice = await CreatorToken.calculateSellPrice(ethers.utils.parseEther("1"))
      let afterNewBuyPrice = await CreatorToken.calculateBuyPrice(ethers.utils.parseEther("5"))

      expect(afterNewSellPrice.lt(newSellPrice)).to.be.true
      expect(afterNewBuyPrice.gt(newBuyPrice)).to.be.true

      expect(afterNewSellPrice.gt(initSellPrice)).to.be.true
      expect(afterNewBuyPrice.lt(initBuyPrice)).to.be.true
    })
  })
})
