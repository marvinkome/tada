import React from "react"
import Cookies from "js-cookie"
import { Wallet } from "ethers"
import { useWalletContext } from "./context"
import { getAccountFromLocalStorage, STORAGE_NAME, toBase64 } from "./cookie"

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

export function useWalletUpdater() {
  const [state, actions] = useWalletContext()
  const [isClient, setIsClient] = React.useState(false)

  React.useEffect(() => {
    ;(async function () {
      setIsClient(true)

      if (!state.address) {
        console.log("Creating a new wallet...")
        const wallet = Wallet.createRandom()
        return actions.initialize({
          account: wallet.mnemonic.phrase,
          address: wallet.address,
          balance: {},
        })
      }

      // get address from local storage
      const mnemonic = getAccountFromLocalStorage()
      const wallet = Wallet.fromMnemonic(mnemonic)
      const address = wallet.address

      // confirm local storage address matches cookie address
      if (!!state.address && address !== state.address) {
        throw new Error("Your cookies are out of sync. Please clear your cookies and try again.")
      }

      // get contract balance
      const balances = await state.contractInterface.getAllTokenBalance(wallet)

      actions.initialize({
        account: mnemonic,
        address: address,
        balance: balances,
      })
    })()
  }, [])

  // storage updates
  React.useEffect(() => {
    if (isClient && !!state.account) {
      const data = toBase64({ mnemonic: state.account })
      window.localStorage.setItem(STORAGE_NAME, data)
    }
  }, [isClient, state.account])

  React.useEffect(() => {
    if (isClient && !!state.address) {
      const data = toBase64({ address: state.address })
      Cookies.set(STORAGE_NAME, data, { expires: 365 * 10, secure: true })
    }
  }, [isClient, state.address])
}
