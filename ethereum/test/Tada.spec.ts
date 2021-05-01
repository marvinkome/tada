import { expect } from "./setup"
import { ethers, network } from "hardhat"
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

  before(async () => {
    ;[account1, account2, account3] = await ethers.getSigners()
  })

  beforeEach(async () => {
    // create shill tokens
    ShillToken = await (await ethers.getContractFactory("ShillToken"))
      .connect(account1)
      .deploy(ethers.utils.parseEther(initialSupply), { gasLimit: 8999999 })

    await ShillToken.deployTransaction.wait()

    // create main contract
    TadaContract = await (await ethers.getContractFactory("TaDa"))
      .connect(account1)
      .deploy(ShillToken.address, { gasLimit: 8999999 })

    await TadaContract.deployTransaction.wait()

    // send money to main contract
    const tx = await ShillToken.connect(account1).transfer(
      await TadaContract.address,
      ethers.utils.parseEther(initialSupply),
      { gasLimit: 8999999 }
    )

    await tx.wait()
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

      await (
        await TadaContract.connect(account1).faucetToken(receiverAddress, googleId1, {
          gasLimit: 8999999,
        })
      ).wait()

      const receiverBalance = (await ShillToken.balanceOf(receiverAddress)).toString()

      expect(receiverBalance).to.eq(ethers.utils.parseEther("50"))
    })

    it("should revert when requesting token twice", async () => {
      const receiverAddress = await account2.getAddress()
      const secondReceiverAddress = await account3.getAddress()

      await (
        await TadaContract.connect(account1).faucetToken(receiverAddress, googleId1, {
          gasLimit: 8999999,
        })
      ).wait()

      const err_tx1 = TadaContract.connect(account1).faucetToken(receiverAddress, googleId1, {
        gasLimit: 8999999,
      })

      if (network.ovm) {
        // @ts-ignore
        await expect((await err_tx1).wait()).to.be.rejected
      } else {
        // @ts-ignore
        await expect(err_tx1).to.be.rejected
      }

      const err_tx2 = TadaContract.connect(account1).faucetToken(receiverAddress, googleId2, {
        gasLimit: 8999999,
      })

      if (network.ovm) {
        // @ts-ignore
        await expect((await err_tx2).wait()).to.be.rejected
      } else {
        // @ts-ignore
        await expect(err_tx2).to.be.rejected
      }

      const err_tx3 = TadaContract.connect(account1).faucetToken(secondReceiverAddress, googleId1, {
        gasLimit: 8999999,
      })

      if (network.ovm) {
        // @ts-ignore
        await expect((await err_tx3).wait()).to.be.rejected
      } else {
        // @ts-ignore
        await expect(err_tx3).to.be.rejected
      }
    })
  })

  describe("Interact with Creators", () => {
    let CreatorToken: Contract

    beforeEach(async () => {
      await (await TadaContract.makeCreatorToken("Mark Rober", "MKR", { gasLimit: 8999999 })).wait()

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
      await (
        await TadaContract.connect(account1).faucetToken(receiverAddress, googleId1, {
          gasLimit: 8999999,
        })
      ).wait()

      // buy 10 SHILL worth of creator tokens
      await (
        await ShillToken.connect(receiver).approve(
          CreatorToken.address,
          ethers.utils.parseEther("10"),
          { gasLimit: 8999999 }
        )
      ).wait()

      await (
        await CreatorToken.connect(receiver).buy(ethers.utils.parseEther("10"), {
          gasLimit: 8999999,
        })
      ).wait()

      // expect user to buy more than 1 creator tokens with 10 SHILL tokens
      let balanceOfReceiver = await CreatorToken.balanceOf(receiverAddress)
      expect(balanceOfReceiver.gte(ethers.utils.parseEther("1"))).to.be.true
    })

    it("user can sell creator tokens", async () => {
      // faucet user account
      const receiver = account2
      const receiverAddress = await account2.getAddress()
      await (
        await TadaContract.connect(account1).faucetToken(receiverAddress, googleId1, {
          gasLimit: 8999999,
        })
      ).wait()

      // buy 10 SHILL worth of creator tokens
      await (
        await ShillToken.connect(receiver).approve(
          CreatorToken.address,
          ethers.utils.parseEther("10"),
          { gasLimit: 8999999 }
        )
      ).wait()

      await (
        await CreatorToken.connect(receiver).buy(ethers.utils.parseEther("10"), {
          gasLimit: 8999999,
        })
      ).wait()

      // sell 1 creator token
      await (
        await CreatorToken.connect(receiver).sell(ethers.utils.parseEther("1"), {
          gasLimit: 8999999,
        })
      ).wait()

      // expect user new balance to be less or equal initial value
      let balanceOfReceiver = await ShillToken.balanceOf(receiverAddress)
      expect(balanceOfReceiver.lte(ethers.utils.parseEther("50"))).to.be.true
    })

    it("creator token price changes when you buy token", async () => {
      // faucet user account
      const receiver = account2
      const receiverAddress = await account2.getAddress()
      await (
        await TadaContract.connect(account1).faucetToken(receiverAddress, googleId1, {
          gasLimit: 8999999,
        })
      ).wait()

      // price of selling 1 creator token
      let initSellPrice = await CreatorToken.calculateSellPrice(ethers.utils.parseEther("1"))

      // price of buying 5 creator token
      let initBuyPrice = await CreatorToken.calculateBuyPrice(ethers.utils.parseEther("5"))

      expect(initSellPrice.gt(initBuyPrice)).to.be.true

      // user buys 10 creator token
      await (
        await ShillToken.connect(receiver).approve(
          CreatorToken.address,
          ethers.utils.parseEther("10"),
          { gasLimit: 8999999 }
        )
      ).wait()

      await (
        await CreatorToken.connect(receiver).buy(ethers.utils.parseEther("10"), {
          gasLimit: 8999999,
        })
      ).wait()

      let newSellPrice = await CreatorToken.calculateSellPrice(ethers.utils.parseEther("1"))
      let newBuyPrice = await CreatorToken.calculateBuyPrice(ethers.utils.parseEther("5"))

      expect(newSellPrice.gt(initSellPrice)).to.be.true
      expect(newBuyPrice.lt(initBuyPrice)).to.be.true

      // user sells some creator tokens
      await (
        await CreatorToken.connect(receiver).sell(ethers.utils.parseEther("1"), {
          gasLimit: 8999999,
        })
      ).wait()

      let afterNewSellPrice = await CreatorToken.calculateSellPrice(ethers.utils.parseEther("1"))
      let afterNewBuyPrice = await CreatorToken.calculateBuyPrice(ethers.utils.parseEther("5"))

      expect(afterNewSellPrice.lt(newSellPrice)).to.be.true
      expect(afterNewBuyPrice.gt(newBuyPrice)).to.be.true

      expect(afterNewSellPrice.gt(initSellPrice)).to.be.true
      expect(afterNewBuyPrice.lt(initBuyPrice)).to.be.true
    })
  })
})
