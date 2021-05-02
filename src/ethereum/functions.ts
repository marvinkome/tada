import * as ethers from "ethers"
import { tadaContract, tokenContract, getCreatorTokenContract, provider } from "./init"

// tada
export async function checkAccountVerification(wallet: ethers.Wallet) {
  return !!(await tadaContract.connect(wallet.connect(provider)).hasFaucetAddress(wallet.address))
}

export async function getCreators() {
  const data = await tadaContract.getCreatorToken()

  return data
}

// creator tokens
export async function getAllTokenPrice(tokens: any[]) {
  const getPriceAndSymbol = async (address: string) => {
    const contract = getCreatorTokenContract(address)

    const price = await contract.estimateBuyPrice(ethers.utils.parseEther("1"))
    const symbol = await contract.symbol()

    return [price, symbol]
  }

  const rawPrices = await Promise.all(tokens.map((token) => getPriceAndSymbol(token.address)))
  const prices = {}

  rawPrices.forEach(([price, symbol]) => {
    prices[symbol] = ethers.utils.formatEther(price.toString())
  })

  return prices
}

export async function getCreatorInfo(tokenAddress: string) {
  const contract = getCreatorTokenContract(tokenAddress)

  const price = await contract.estimateBuyPrice(ethers.utils.parseEther("1"))
  const symbol = await contract.symbol()
  const name = await contract.name()

  return {
    price: ethers.utils.formatEther(price.toString()),
    symbol,
    name,
    contract,
  }
}

export async function getTokenBuyPrice(contract: ethers.Contract, amount: string) {
  const price = await contract.estimateBuyPrice(ethers.utils.parseEther(amount))
  return ethers.utils.formatEther(price.toString())
}

export async function getTokenSellPrice(contract: ethers.Contract, amount: string) {
  const price = await contract.calculateSellPrice(ethers.utils.parseEther(amount))
  return ethers.utils.formatEther(price.toString())
}

export async function buyTokens(_wallet: ethers.Wallet, contract: ethers.Contract, amount: string) {
  const wallet = _wallet.connect(provider)

  const approveTx = await tokenContract
    .connect(wallet)
    .approve(contract.address, ethers.utils.parseEther(amount), { gasLimit: 8999999, gasPrice: 0 })
  await approveTx.wait()

  const buyTx = await contract
    .connect(wallet)
    .buy(ethers.utils.parseEther(amount), { gasLimit: 8999999, gasPrice: 0 })
  await buyTx.wait()
}

export async function sellTokens(wallet: ethers.Wallet, contract: ethers.Contract, amount: string) {
  wallet = wallet.connect(provider)

  const sellTx = await contract
    .connect(wallet)
    .sell(ethers.utils.parseEther(amount), { gasLimit: 8999999, gasPrice: 0 })
  await sellTx.wait()
}
