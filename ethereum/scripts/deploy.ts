import fs from "fs"
import { ethers, artifacts } from "hardhat"

function saveFrontendFiles(tokenAddress: string, appAddress: string) {
  const contractsDir = __dirname + "/../../src/ethereum/contracts"
  if (!fs.existsSync(contractsDir)) fs.mkdirSync(contractsDir)

  const TadaArtifact = artifacts.readArtifactSync("TaDa")
  fs.writeFileSync(contractsDir + "/TaDa.json", JSON.stringify(TadaArtifact.abi, null, 2))

  const ShillTokenArtifact = artifacts.readArtifactSync("ShillToken")
  fs.writeFileSync(
    contractsDir + "/ShillToken.json",
    JSON.stringify(ShillTokenArtifact.abi, null, 2)
  )

  const CreatorTokenArtifact = artifacts.readArtifactSync("CreatorToken")
  fs.writeFileSync(
    contractsDir + "/CreatorToken.json",
    JSON.stringify(CreatorTokenArtifact.abi, null, 2)
  )

  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify({ ShillToken: tokenAddress, Tada: appAddress }, undefined, 2)
  )
}

async function main() {
  const initialSupply = 10_000_000
  const [deployer] = await ethers.getSigners()

  console.log("Deploying contracts with the account: ", deployer.address)
  console.log("Account balance: ", (await deployer.getBalance()).toString())

  const ShillToken = await ethers.getContractFactory("ShillToken")
  const Tada = await ethers.getContractFactory("TaDa")

  const shillToken = await ShillToken.deploy(ethers.utils.parseEther(`${initialSupply}`))
  const tada = await Tada.deploy(shillToken.address)

  await shillToken.connect(deployer).transfer(tada.address, initialSupply * 0.8)

  console.log("TaDa Contract address: ", tada.address)
  console.log("ShillToken Contract address: ", shillToken.address)

  // deploy initial creator tokens
  // store tokens in firestore

  // save frontend files
  saveFrontendFiles(shillToken.address, tada.address)
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
