import * as ethers from "ethers"

export class ContractInterface {
  provider: ethers.providers.JsonRpcProvider
  contracts: Map<string, ethers.Contract>

  constructor(provider: ethers.providers.JsonRpcProvider, contracts: Map<string, ethers.Contract>) {
    this.contracts = contracts
    this.provider = provider
  }

  addContract(name: string, contract: ethers.Contract) {
    let hasContract = this.contracts.get(name)
    if (!hasContract) {
      this.contracts.set(name, contract)
    }
  }

  async getAllTokenBalance(wallet: ethers.Wallet) {
    let balances: { [key: string]: string } = {}

    for (let [token, contract] of this.contracts) {
      let balance: ethers.BigNumber = await contract
        .connect(wallet.connect(this.provider))
        .balanceOf(wallet.address)

      balances[token] = ethers.utils.formatEther(balance.toString())
    }

    return balances
  }

  async getTokenBalance(token: string, wallet: ethers.Wallet) {
    let contract = this.contracts.get(token)
    if (!contract) {
      console.error("Token not added to wallet")
      return "0"
    }

    let balance: ethers.BigNumber = await contract
      .connect(wallet.connect(this.provider))
      .balanceOf(wallet.address)

    return ethers.utils.formatEther(balance.toString())
  }

  async transferToken(token: string, wallet: ethers.Wallet, address: string, amount: number) {
    let contract = this.contracts.get(token)
    if (!contract) {
      throw new Error("Token not added to wallet")
    }

    await contract.connect(wallet.connect(this.provider)).transfer(address, amount)
  }
}
