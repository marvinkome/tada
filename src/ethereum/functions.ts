import * as ethers from "ethers"
import { tadaContract, provider } from "./init"

export async function checkAccountVerification(wallet: ethers.Wallet) {
  return !!(await tadaContract.connect(wallet.connect(provider)).hasFaucetAddress(wallet.address))
}
