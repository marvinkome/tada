import Head from "next/head"
import { ChakraProvider } from "@chakra-ui/react"
import { getAddressFromCookie, WalletProvider } from "burner-wallet"
import { provider, tokenContracts } from "ethereum"
import { theme } from "theme"

function MyApp({ Component, pageProps }) {
  const address = getAddressFromCookie(false)

  return (
    <ChakraProvider theme={theme}>
      <Head>
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link rel="shortcut icon" type="image/png" href="/favicon.png" />
        <link
          href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:ital,wght@0,400;0,600;1,700&display=swap"
          rel="stylesheet"
        />

        <title>TaDa! - Buy and sell influencer stocks</title>
      </Head>

      <WalletProvider provider={provider} contracts={tokenContracts} address={address}>
        <Component {...pageProps} />
      </WalletProvider>
    </ChakraProvider>
  )
}

export default MyApp
