import * as ethers from "ethers"
import { tadaContract } from "./index"

export async function fundUser(userAddress: string, googleId: string) {
  const deployer = ethers.Wallet.fromMnemonic(process.env.mnemonic)

  // call the faucet and send user shill tokens
  await tadaContract.connect(deployer).faucetToken(userAddress, googleId)

  // also send the user some eth <3
  const transaction = await deployer.sendTransaction({
    to: userAddress,
    value: ethers.utils.parseEther("1"),
  })

  await transaction.wait()
}
