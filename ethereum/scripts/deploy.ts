import { saveFrontendFiles } from "./helpers"
import { ethers } from "hardhat"
import initialCreators from "../initial-creators.json"

async function main() {
  const initialSupply = 10_000_000
  const [deployer] = await ethers.getSigners()

  console.log("Deploying contracts with the account: ", deployer.address)
  console.log("Account balance: ", (await deployer.getBalance()).toString())

  const ShillToken = await ethers.getContractFactory("ShillToken")
  const Tada = await ethers.getContractFactory("TaDa")

  const shillToken = await ShillToken.deploy(ethers.utils.parseEther(`${initialSupply}`))
  const tada = await Tada.deploy(shillToken.address)

  await shillToken
    .connect(deployer)
    .transfer(tada.address, ethers.utils.parseEther(`${initialSupply * 0.8}`))

  console.log("TaDa Contract address: ", tada.address)
  console.log("ShillToken Contract address: ", shillToken.address)

  // deploy initial creator tokens
  console.log("deploying initial creator tokens...")
  for (let creator of initialCreators.creators.reverse()) {
    await tada.connect(deployer).makeCreatorToken(creator.name, creator.token)
  }
  console.log("deployed initial creator tokens...DONE")

  // save frontend files
  saveFrontendFiles(shillToken.address, tada.address)
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
