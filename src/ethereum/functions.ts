import * as ethers from "ethers"
import { tadaContract, getCreatorTokenContract, provider } from "./init"

// tada
export async function checkAccountVerification(wallet: ethers.Wallet) {
  return !!(await tadaContract.connect(wallet.connect(provider)).hasFaucetAddress(wallet.address))
}

export async function getCreators(wallet: ethers.Wallet) {
  const data = await tadaContract.connect(wallet.connect(provider)).getCreatorToken()

  return data
}

// creator tokens
export async function getAllTokenPrice(wallet: ethers.Wallet, tokens: any[]) {
  const getPriceAndSymbol = async (address: string) => {
    const contract = getCreatorTokenContract(address).connect(wallet.connect(provider))

    const price = await contract.estimateBuyPrice(ethers.utils.parseEther("1"))
    const symbol = await contract.symbol()

    return [price, symbol]
  }

  const rawPrices = await Promise.all(tokens.map((token) => getPriceAndSymbol(token.address)))
  const prices = {}

  rawPrices.forEach(([price, symbol]) => {
    prices[symbol] = parseInt(ethers.utils.formatEther(price.toString()), 10)
  })

  return prices
}

export async function getCreatorInfo(wallet: ethers.Wallet, tokenAddress: string) {
  const contract = getCreatorTokenContract(tokenAddress).connect(wallet.connect(provider))

  const price = await contract.estimateBuyPrice(ethers.utils.parseEther("1"))
  const symbol = await contract.symbol()
  const name = await contract.name()

  return { price: parseInt(ethers.utils.formatEther(price.toString()), 10), symbol, name, contract }
}
