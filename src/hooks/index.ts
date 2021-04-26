import React from "react"
import _sortBy from "lodash.sortby"
import { useRouter } from "next/router"
import { useToast } from "@chakra-ui/toast"
import { useAddTokenToWallet, useUpdateBalance, useWallet } from "burner-wallet/hooks"
import { useGoogleLogin } from "react-google-login"
import { checkAccountVerification, getCreators, getAllTokenPrice, getCreatorInfo } from "ethereum"

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

export function useGetCreators() {
  const toast = useToast()
  const wallet = useWallet()
  const addTokenToWallet = useAddTokenToWallet()
  const [hasLoadedPrice, setHasLoadedPrice] = React.useState(false)
  const [tokens, setTokens] = React.useState<any[]>([])

  // fetch token
  React.useEffect(() => {
    if (!wallet) return

    async function getData() {
      try {
        const tokenData = await getCreators(wallet)
        let tokens = tokenData.map((tk: any) => ({
          address: tk.creatorToken,
          symbol: tk.tokenSymbol,
          name: tk.tokenName,
        }))

        // ---- SIDE EFFECT ----
        // add token to burner wallet
        tokens.forEach((token) => {
          addTokenToWallet(token.symbol, token.address)
        })
        // ---- END SIDE EFFECT ----

        setHasLoadedPrice(false)
        setTokens(tokens)
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
  }, [wallet])

  // fetch price after tokens have loaded
  React.useEffect(() => {
    if (!wallet || !tokens.length || hasLoadedPrice) return

    async function getData() {
      try {
        // fetch additional data
        const prices = await getAllTokenPrice(wallet, tokens)
        if (!prices) return

        const data = tokens.map((token) => ({
          ...token,
          price: prices[token.symbol],
        }))

        const newTokens = _sortBy(data, ["price"])

        setHasLoadedPrice(true)
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
  }, [wallet, tokens, hasLoadedPrice])

  return { data: tokens }
}

export function useGetCreatorData() {
  const router = useRouter()
  const toast = useToast()
  const wallet = useWallet()
  const updateBalance = useUpdateBalance()
  const addTokenToWallet = useAddTokenToWallet()
  const [creatorData, setCreatorData] = React.useState<any>()
  const { creatorId } = router.query

  // fetch address info
  React.useEffect(() => {
    if (!wallet || !creatorId) return

    async function getData() {
      try {
        const creatorData = await getCreatorInfo(wallet, creatorId as string)
        setCreatorData(creatorData)

        addTokenToWallet(creatorData.symbol, creatorData.contract)
        updateBalance(creatorData.symbol)
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
  }, [wallet, creatorId])

  return { data: creatorData }
}
