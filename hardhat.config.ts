require("dotenv").config({ path: ".env.local" })
import { HardhatUserConfig } from "hardhat/types"

import "./ethereum/tasks/faucet"
import "@nomiclabs/hardhat-ethers"
import "@nomiclabs/hardhat-waffle"
import "@eth-optimism/hardhat-ovm"

const config: HardhatUserConfig = {
  solidity: {
    version: "0.7.6",
    settings: {
      optimizer: {
        enabled: true,
      },
    },
  },
  ovm: {
    solcVersion: "0.7.6",
  },
  networks: {
    "optimism-prod": {
      url: "https://kovan.optimism.io",
      accounts: {
        mnemonic: process.env.mnemonic,
      },
    },
    optimism: {
      url: "http://127.0.0.1:8545",
      accounts: {
        mnemonic: process.env.mnemonic,
      },
      gasPrice: 0,
      ovm: true,
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
