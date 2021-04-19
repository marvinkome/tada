import Head from "next/head";
import { ChakraProvider } from "@chakra-ui/react";
import { theme } from "../theme";

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider theme={theme}>
      <Head>
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;600;i700&display=swap"
          rel="stylesheet"
        />

        <title>TaDa! - Buy and sell influence stocks</title>
      </Head>

      <Component {...pageProps} />
    </ChakraProvider>
  );
}
export default MyApp;
