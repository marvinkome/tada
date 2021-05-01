import fs from "fs"
import { artifacts } from "hardhat"

export function saveFrontendFiles(tokenAddress: string, appAddress: string) {
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
