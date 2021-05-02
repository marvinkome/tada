import * as ethers from "ethers"
import { provider, tadaContract } from "ethereum"
import type { NextApiRequest, NextApiResponse } from "next"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(400).json({ error: "Invalid method" })
  }

  const { address, googleId } = req.body

  try {
    if (!ethers.utils.isAddress(address) || !googleId.trim().length) {
      return res.status(400).json({ message: "Invalid address or google ID" })
    }

    const deployer = ethers.Wallet.fromMnemonic(process.env.mnemonic).connect(provider)

    // call the faucet and send user shill tokens
    const tx = await tadaContract
      .connect(deployer)
      .faucetToken(address, googleId, { gasLimit: 8999999, gasPrice: 0 })
    await tx.wait()

    // also send the user some eth <3
    // pending until optimism needs gas
    // const transaction = await deployer.sendTransaction({
    //   to: address,
    //   value: ethers.utils.parseEther("1.0"),
    // })

    // await transaction.wait()
    return res.status(200).json({ message: "Account funded" })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: "Something went wrong" })
  }
}
