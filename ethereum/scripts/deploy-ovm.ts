import { ethers, network } from "hardhat"
import { saveFrontendFiles } from "./helpers"
import initialCreators from "../initial-creators.json"

async function extendHre() {
  // HACK: override ethers provider until it's fixed in @eth-optimism/hardhat-ovm
  // @ts-ignore
  const provider = new ethers.providers.JsonRpcProvider(network.config.url)
  provider.pollingInterval = ethers.provider.pollingInterval
  provider.getGasPrice = ethers.provider.getGasPrice
  ethers.provider = provider

  let signers = await ethers.getSigners()
  signers = signers.map((signer) => signer.connect(provider))

  ethers.getSigners = async () => signers
}
async function main() {
  const initialSupply = 10_000_000

  await extendHre()
  let [deployer] = await ethers.getSigners()

  console.log("Deploying contracts with the account: ", deployer.address)
  console.log("Account balance: ", (await deployer.getBalance()).toString())

  const ShillToken = await ethers.getContractFactory("ShillToken")
  const Tada = await ethers.getContractFactory("TaDa")

  // deploy shill token
  const shillToken = await ShillToken.deploy(ethers.utils.parseEther(`${initialSupply}`), {
    gasLimit: 8999999,
    gasPrice: ethers.BigNumber.from("0"),
  })
  await shillToken.deployTransaction.wait()

  // deploy tada contract
  const tada = await Tada.deploy(shillToken.address, {
    gasLimit: 8999999,
    gasPrice: ethers.BigNumber.from("0"),
  })
  await tada.deployTransaction.wait()

  // transfer 80% of shill to tada contract
  await (
    await shillToken
      .connect(deployer)
      .transfer(tada.address, ethers.utils.parseEther(`${initialSupply * 0.8}`))
  ).wait()

  console.log("TaDa Contract address: ", tada.address)
  console.log("ShillToken Contract address: ", shillToken.address)

  // deploy initial creator tokens
  console.log("deploying initial creator tokens...")
  for (let creator of initialCreators.creators.reverse()) {
    const tx = await tada.connect(deployer).makeCreatorToken(creator.name, creator.token, {
      gasLimit: 8999999,
      gasPrice: ethers.BigNumber.from("0"),
    })
    await tx.wait()
    console.log(`deployed ${creator.name}`)
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
