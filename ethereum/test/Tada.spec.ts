import { expect } from "./setup"
import { ethers } from "hardhat"
import { Contract, Signer } from "ethers"

describe("Tada!", () => {
  const initialSupply = "5000.0"
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
      const tokenBalanceInWei = (await ShillToken.balanceOf(TadaContract.address)).toString()
      const tokenBalanceToScale = ethers.utils.formatEther(tokenBalanceInWei)
      expect(initialSupply).to.eq(tokenBalanceToScale)
    })
  })

  describe("Token Transfer", () => {
    it("should transfer token to user", async () => {
      const receiver = account2
      const receiverAddress = await account2.getAddress()

      await TadaContract.connect(receiver).faucetToken(googleId1)
      const receiverBalance = (await ShillToken.balanceOf(receiverAddress)).toString()

      expect(receiverBalance).to.eq(ethers.utils.parseEther("50"))
    })

    it("should revert when requesting token twice", async () => {
      const receiver = account2
      const receiver2 = account3

      await TadaContract.connect(receiver).faucetToken(googleId1)

      await expect(TadaContract.connect(receiver).faucetToken(googleId1)).to.be.revertedWith(
        "User signed up already"
      )

      await expect(TadaContract.connect(receiver).faucetToken(googleId2)).to.be.revertedWith(
        "User signed up already"
      )

      await expect(TadaContract.connect(receiver2).faucetToken(googleId1)).to.be.revertedWith(
        "User signed up already"
      )
    })
  })

  describe("Interact with Creators", () => {
    let CreatorToken: Contract

    beforeEach(async () => {
      const address = await TadaContract.makeCreatorToken("Mark Rober", "MKR")
      CreatorToken = await ethers.getContractAt("CreatorToken", address)
    })

    it("creates creator token", async () => {
      expect(CreatorToken.address).to.exist
    })

    // it("TaDa contract has correct balance", async () => {
    //   const tokenBalanceInWei = (await CreatorToken.balanceOf(TadaContract.address)).toString()
    //   const tokenBalanceToScale = ethers.utils.formatEther(tokenBalanceInWei)
    //   console.log(tokenBalanceToScale)
    // })
  })
})
