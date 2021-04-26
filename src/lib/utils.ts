import * as ethFunctions from "ethereum/functions"
import * as ethers from "ethers"

export function truncateAddress(address: string, length: number): string {
  return `${address.substring(0, length + 2)}...${address.substring(
    address.length - length,
    address.length
  )}`
}

export const fetcher = (method: string, wallet: ethers.Wallet, ...args: any[]) => {
  return ethFunctions[method](wallet, ...args)
}
