import * as ethers from "ethers"

import shillTokenABI from "./contracts/ShillToken.json"
import creatorTokenABI from "./contracts/CreatorToken.json"
import tadaABI from "./contracts/TaDa.json"

import addresses from "./contracts/contract-address.json"

// const provider = new ethers.providers.JsonRpcProvider("https://kovan.optimism.io")
export const provider = new ethers.providers.JsonRpcProvider()

// contracts
export const tadaContract = new ethers.Contract(addresses.Tada, tadaABI, provider)

export const tokenContract = new ethers.Contract(addresses.ShillToken, shillTokenABI, provider)
export const tokenContracts = new Map<string, ethers.Contract>([["shill", tokenContract]])

export function getCreatorTokenContract(address: string) {
  return new ethers.Contract(address, creatorTokenABI, provider)
}
