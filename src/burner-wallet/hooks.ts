import React from "react"
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

export function useBalance(token: string) {
  const [{ balance }] = useWalletContext()

  return balance[token]
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
