import { task } from "hardhat/config"

const DEV = process.env.NODE_ENV !== "production"
if (DEV) {
  task("faucet", "Sends ETH to an address")
    .addPositionalParam("receiver", "The address that will receive ETH")
    .setAction(async ({ receiver }, hre) => {
      if (hre.network.name === "hardhat") {
        console.warn(
          "You are running the faucet task with Hardhat network, which" +
            "gets automatically created and destroyed every time. Use the Hardhat" +
            " option '--network localhost'"
        )
      }

      const [sender] = await hre.ethers.getSigners()
      const tx = await sender.sendTransaction({
        to: receiver,
        value: hre.ethers.constants.WeiPerEther.mul(hre.ethers.BigNumber.from(50)),
      })

      await tx.wait()

      console.warn(`Transferred 50 ETH to ${receiver}`)
    })
}
