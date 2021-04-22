require("dotenv").config({ path: ".env.local" })
import { HardhatUserConfig } from "hardhat/types"

import "./ethereum/tasks/faucet"
import "@nomiclabs/hardhat-ethers"
import "@nomiclabs/hardhat-waffle"

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.3",
    settings: {
      optimizer: {
        enabled: true,
      },
    },
  },
  networks: {
    kovenOE: {
      url: "https://kovan.optimism.io",
      accounts: {
        mnemonic: process.env.mnemonic,
      },
    },
  },
  paths: {
    root: "./ethereum",
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
}

export default config
