import React, { useEffect } from "react"
import * as ethers from "ethers"
import { Wallet } from "ethers"
import { useWalletContext } from "./context"

export function useAddress() {
  const [{ address }] = useWalletContext()
  return address
}

export function useMnemonic() {
  const [{ account }] = useWalletContext()
  return account
}

export function useWallet() {
  const [{ account }] = useWalletContext()

  const wallet = React.useMemo(() => {
    return account ? Wallet.fromMnemonic(account) : null
  }, [account])

  return wallet
}

export function useAddTokenToWallet() {
  const [{ contractInterface }] = useWalletContext()
  return (token: string, contract: ethers.Contract) => {
    contractInterface.addContract(token, contract)
  }
}

export function useGetTokenAddress() {
  const [state] = useWalletContext()

  return (token: string) => {
    return state.contractInterface.contracts.get(token).address
  }
}

export function useBalance(token: string) {
  const [{ balance }] = useWalletContext()

  return balance[token]
}

export function useUpdateBalance() {
  const [state, actions] = useWalletContext()
  const wallet = useWallet()

  return React.useCallback(
    async (token: string) => {
      const balance = await state.contractInterface.getTokenBalance(token, wallet)
      actions.updateBalance(token, balance)
    },
    [wallet]
  )
}

export function useAllBalances() {
  const [{ balance }] = useWalletContext()

  return balance
}

export function useImportWallet() {
  const [state, actions] = useWalletContext()

  return React.useCallback(async (mnemonic: string) => {
    const wallet = Wallet.fromMnemonic(mnemonic)
    const balance = await state.contractInterface.getAllTokenBalance(wallet)
    const address = wallet.address

    actions.initialize({
      account: mnemonic,
      address: address,
      balance,
    })
  }, [])
}

export function useTransferTokens(token: string) {
  const [state, actions] = useWalletContext()
  const wallet = useWallet()

  const transferToken = React.useCallback(
    async (amount: number, receiver: string) => {
      await state.contractInterface.transferToken(token, wallet, receiver, amount)

      const newBalance = state.balance[token] + amount
      actions.updateBalance(token, newBalance)
    },
    [wallet, state.balance[token]]
  )

  return transferToken
}
