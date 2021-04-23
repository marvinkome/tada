import { ethers, Wallet } from "ethers"
import { createContext, useContext, useReducer, useCallback, useMemo } from "react"
import { ContractInterface } from "./contract"

const REDUCER_ACTIONS = {
  INIT: "initialize",
  ADD_ACCOUNT: "addAccount",
  UPDATE_BALANCE: "updateBalance",
  RESET: "reset",
}

export const WalletContext = createContext([
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
  const [state, dispatch] = useReducer(walletReducer, {
    account: "",
    address,
    balance: {},

    provider,
    contracts: new Map<string, ethers.Contract>(),
  })

  const initialize = useCallback(
    (data: { account?: string; address?: string; balance?: { [key: string]: number } }) => {
      dispatch({
        type: REDUCER_ACTIONS.INIT,
        payload: data,
      })
    },
    []
  )

  const addAccount = useCallback((account?: string) => {
    dispatch({ type: REDUCER_ACTIONS.ADD_ACCOUNT, payload: { account } })
  }, [])

  const updateBalance = useCallback((token: string, newBalance: number) => {
    dispatch({ type: REDUCER_ACTIONS.UPDATE_BALANCE, payload: { newBalance, token } })
  }, [])

  const reset = useCallback(() => {
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

// context
export function useWalletContext() {
  return useContext(WalletContext)
}

type Props = {
  address?: string
  contracts: Map<string, ethers.Contract>
  provider: ethers.providers.JsonRpcProvider
}
export const WalletProvider: React.FC<Props> = (props) => {
  const { state, ...actions } = useWallet(props.provider, props.address)
  const contractInterface = new ContractInterface(props.provider, props.contracts)

  const value = useMemo(() => [{ ...state, contractInterface }, actions], [
    state,
    actions,
    contractInterface,
  ])

  return <WalletContext.Provider value={value}>{props.children}</WalletContext.Provider>
}
