import Head from "next/head"
import App from "next/app"
import type { AppProps, AppContext } from "next/app"
import { ChakraProvider } from "@chakra-ui/react"
import { getAddressFromCookie, WalletProvider } from "burner-wallet"
import { theme } from "theme"

function MyApp({ Component, pageProps, initialAddress }) {
  return (
    <ChakraProvider theme={theme}>
      <Head>
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:ital,wght@0,400;0,600;1,700&display=swap"
          rel="stylesheet"
        />

        <title>TaDa! - Buy and sell influence stocks</title>
      </Head>

      <WalletProvider address={initialAddress}>
        <Component {...pageProps} />
      </WalletProvider>
    </ChakraProvider>
  )
}

MyApp.getInitialProps = async (appContext: AppContext) => {
  const { req, res } = appContext.ctx
  const serverSide = !!req && !!res

  // get current address of the user
  const address = getAddressFromCookie(appContext.ctx, serverSide)

  const appProps = await App.getInitialProps(appContext)
  return { ...appProps, initialAddress: address }
}

export default MyApp
