import React from "react"
import _sortBy from "lodash.sortby"
import _debounce from "lodash.debounce"
import { useToast } from "@chakra-ui/toast"
import { useAddTokenToWallet, useUpdateBalance, useWallet } from "burner-wallet/hooks"
import { useGoogleLogin } from "react-google-login"
import {
  buyTokens,
  checkAccountVerification,
  getAllTokenPrice,
  getCreatorTokenContract,
  sellTokens,
} from "ethereum"

export function useVerifyAccount() {
  const [isVerified, setIsVerified] = React.useState(true)
  const toast = useToast()
  const updateBalance = useUpdateBalance()
  const wallet = useWallet()

  React.useEffect(() => {
    if (!wallet) return

    async function checkVerification() {
      const verified = await checkAccountVerification(wallet)
      setIsVerified(verified)
    }

    checkVerification()
  }, [wallet])

  const onSuccess = React.useCallback(
    async (googleResp: any) => {
      try {
        const response = await fetch("/api/auth-relayer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address: wallet.address,
            googleId: googleResp.googleId,
          }),
        })

        const data = await response.json()
        if (data.message === "Account funded") {
          await updateBalance("shill")
          setIsVerified(true)
        }
      } catch (err) {
        console.error(err)

        toast({
          title: "Airdrop Failed",
          description: "Something went wrong",
          status: "error",
          position: "top-right",
          isClosable: true,
        })
      }
    },
    [wallet]
  )

  const data = useGoogleLogin({
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    onSuccess,
    onFailure: (res) => {
      console.log("Login failed", res)
      toast({
        title: "Login Failed",
        description: res.details || "Unexpected error occurred",
        status: "error",
        position: "top-right",
        isClosable: true,
      })
    },
  })

  return { ...data, isVerified }
}

export function useGetCreatorsPrice(initialTokens: any[]) {
  const toast = useToast()
  const [tokens, setTokens] = React.useState<any[]>(initialTokens)

  // fetch price after tokens have loaded
  React.useEffect(() => {
    if (!initialTokens.length) return

    async function getData() {
      try {
        // fetch additional data
        const prices = await getAllTokenPrice(initialTokens)
        if (!prices) return

        const data = tokens.map((token) => ({
          ...token,
          price: prices[token.symbol],
        }))

        const newTokens = _sortBy(data, ["price"])
        setTokens(newTokens.reverse())
      } catch (err) {
        // set error
        console.error(err)
        toast({
          title: "Error fetching token data",
          status: "error",
          position: "top-right",
          isClosable: true,
        })
      }
    }

    getData()
  }, [initialTokens])

  return { data: tokens }
}

export function useUpdateCreatorBalance({ address, symbol }: any) {
  const toast = useToast()
  const wallet = useWallet()
  const updateBalance = useUpdateBalance()
  const addTokenToWallet = useAddTokenToWallet()
  const contract = getCreatorTokenContract(address)

  // fetch address info
  const callback = React.useCallback(async () => {
    if (!wallet) return

    try {
      addTokenToWallet(symbol, contract)
      updateBalance(symbol)
    } catch (err) {
      // set error
      console.error(err)
      toast({
        title: "Error fetching token data",
        status: "error",
        position: "top-right",
        isClosable: true,
      })
    }
  }, [wallet])

  return { wallet, updateCreatorBalance: callback }
}

export function useBuyToken({ address, symbol }: any) {
  const contract = getCreatorTokenContract(address)
  const updateBalance = useUpdateBalance()
  const toast = useToast()
  const wallet = useWallet()

  return React.useCallback(
    async (amount: string) => {
      try {
        await buyTokens(wallet, contract, amount)

        // update balance
        await updateBalance("shill")
        await updateBalance(symbol)
      } catch (err) {
        // set error
        console.error(err)
        toast({
          title: "Error purchasing tokens",
          description: err.message,
          status: "error",
          position: "top-right",
          isClosable: true,
        })
      }
    },
    [wallet]
  )
}

export function useSellToken({ address, symbol }: any) {
  const contract = getCreatorTokenContract(address)
  const updateBalance = useUpdateBalance()
  const toast = useToast()
  const wallet = useWallet()

  return React.useCallback(
    async (amount: string) => {
      try {
        await sellTokens(wallet, contract, amount)

        // update balance
        await updateBalance("shill")
        await updateBalance(symbol)
      } catch (err) {
        // set error
        console.error(err)
        toast({
          title: "Error selling tokens",
          description: err.message,
          status: "error",
          position: "top-right",
          isClosable: true,
        })
      }
    },
    [wallet]
  )
}
