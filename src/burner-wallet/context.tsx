import React from "react"
import Cookies from "js-cookie"
import { ethers, Wallet } from "ethers"
import { ContractInterface } from "./contract"
import { getAccountFromLocalStorage, STORAGE_NAME, toBase64 } from "./cookie"

const REDUCER_ACTIONS = {
  INIT: "initialize",
  ADD_ACCOUNT: "addAccount",
  UPDATE_BALANCE: "updateBalance",
  RESET: "reset",
}

export const WalletContext = React.createContext([
  // state
  {
    account: "",
    address: "",
    balance: {} as { [key: string]: number },

    contractInterface: null as ContractInterface,
  },

  // actions
  {
    initialize: (data: {
      account?: string
      address?: string
      balance?: { [key: string]: number }
    }) => null,
    addAccount: (account?: string) => null,
    updateBalance: (token: string, newBalance: number) => null,
    reset: () => null,
  },
])

// state reducer
function walletReducer(state, action) {
  switch (action.type) {
    case REDUCER_ACTIONS.INIT: {
      return { ...state, ...action.payload }
    }

    case REDUCER_ACTIONS.ADD_ACCOUNT: {
      const { account } = action.payload
      const address = Wallet.fromMnemonic(account).address

      return { ...state, account, address }
    }

    case REDUCER_ACTIONS.UPDATE_BALANCE: {
      const { token, newBalance } = action.payload
      const balance = { ...state.balance, [token]: newBalance }

      return { ...state, balance }
    }

    case REDUCER_ACTIONS.RESET: {
      return { account: null, address: null }
    }

    default:
      throw new Error()
  }
}

function useWallet(provider: ethers.providers.JsonRpcProvider, address?: string) {
  const [state, dispatch] = React.useReducer(walletReducer, {
    account: "",
    address,
    balance: {},

    provider,
    contracts: new Map<string, ethers.Contract>(),
  })

  const initialize = React.useCallback(
    (data: { account?: string; address?: string; balance?: { [key: string]: number } }) => {
      dispatch({
        type: REDUCER_ACTIONS.INIT,
        payload: data,
      })
    },
    []
  )

  const addAccount = React.useCallback((account?: string) => {
    dispatch({ type: REDUCER_ACTIONS.ADD_ACCOUNT, payload: { account } })
  }, [])

  const updateBalance = React.useCallback((token: string, newBalance: number) => {
    dispatch({ type: REDUCER_ACTIONS.UPDATE_BALANCE, payload: { newBalance, token } })
  }, [])

  const reset = React.useCallback(() => {
    dispatch({ type: REDUCER_ACTIONS.RESET, payload: {} })
  }, [])

  return {
    state,
    initialize,
    addAccount,
    updateBalance,
    reset,
  }
}

// updater component
function WalletUpdater() {
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

  return null
}

// context
export function useWalletContext() {
  return React.useContext(WalletContext)
}

type Props = {
  address?: string
  contracts: Map<string, ethers.Contract>
  provider: ethers.providers.JsonRpcProvider
}
export const WalletProvider: React.FC<Props> = (props) => {
  const { state, ...actions } = useWallet(props.provider, props.address)
  const contractInterface = new ContractInterface(props.provider, props.contracts)

  const value = React.useMemo(() => [{ ...state, contractInterface }, actions], [
    state,
    actions,
    contractInterface,
  ])

  return (
    <WalletContext.Provider value={value}>
      {props.children}
      <WalletUpdater />
    </WalletContext.Provider>
  )
}
