import React from "react"
import { useToast } from "@chakra-ui/toast"
import { useUpdateBalance, useWallet } from "burner-wallet/hooks"
import { useGoogleLogin } from "react-google-login"
import { checkAccountVerification } from "ethereum"

export function useVerifyAccount() {
  const [isVerified, setIsVerified] = React.useState(true)
  const toast = useToast()
  const updateBalance = useUpdateBalance("shill")
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
          await updateBalance()
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
