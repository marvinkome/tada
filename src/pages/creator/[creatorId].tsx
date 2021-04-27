import React from "react"
import NextImage from "next/image"
import { GetStaticPaths, GetStaticProps } from "next"
import { getCreatorInfo, getCreators, getCreatorTokenContract } from "ethereum"
import {
  chakra,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Input,
  Button,
  Skeleton,
  useToast,
} from "@chakra-ui/react"
import { Header } from "components/header"
import { CoinIcon } from "components/coin-icon"
import { useAddTokenToWallet, useBalance, useUpdateBalance, useWallet } from "burner-wallet/hooks"

const Image = chakra(NextImage, {
  shouldForwardProp: () => true,
})

export function useUpdateCreatorBalance(address: string, symbol: string) {
  const toast = useToast()
  const wallet = useWallet()
  const updateBalance = useUpdateBalance()
  const addTokenToWallet = useAddTokenToWallet()
  const contract = getCreatorTokenContract(address)

  // fetch address info
  React.useEffect(() => {
    if (!wallet) return

    async function getData() {
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
    }

    getData()
  }, [wallet])
}

const CreatorPage: React.FC<{ tokenData: any }> = ({ tokenData }) => {
  useUpdateCreatorBalance(tokenData.address, tokenData.symbol)
  const balance = useBalance(tokenData.symbol || "")

  return (
    <Container my={[4, 14]}>
      <Header />

      {/*  body */}
      <chakra.main my={10} mx={3}>
        {/* header */}
        <VStack mb={16} spacing={7}>
          <Image
            rounded="full"
            width="150px"
            height="150px"
            objectFit="cover"
            src={`/creators/${tokenData.symbol.toLowerCase()}.jpeg`}
            alt={tokenData.name}
          />

          <Heading variant="title">{tokenData.name}</Heading>
        </VStack>

        {/* token info */}
        <VStack mb={10} spacing={10} align="stretch">
          <chakra.div>
            <Heading mb={2} fontSize="lg" variant="subTitle">
              Token Price
            </Heading>

            <HStack>
              <CoinIcon mr={2} />

              <Text>{tokenData.price}</Text>
            </HStack>
          </chakra.div>

          <chakra.div>
            <Heading mb={2} fontSize="lg" variant="subTitle">
              You own
            </Heading>

            {balance === 0 || !!balance ? (
              <Text>{balance}</Text>
            ) : (
              <Skeleton width="40px" height="24px" />
            )}
          </chakra.div>
        </VStack>

        {/* token actions */}
        <chakra.div mb={20}>
          <Input mb={10} rounded="xl" size="lg" placeholder="Enter amount" />

          <VStack spacing={2}>
            <Button size="lg" variant="primary" isFullWidth>
              Buy Tokens
            </Button>

            <Text>OR</Text>

            <Button isDisabled={balance === 0} size="lg" variant="secondary" isFullWidth>
              Sell Tokens
            </Button>
          </VStack>
        </chakra.div>
      </chakra.main>
    </Container>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const tokenData = await getCreators()
  const paths = tokenData.map((token: any) => ({
    params: { creatorId: token.creatorToken },
  }))

  return { paths, fallback: false }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  // fetch token info
  const { contract, ...data } = await getCreatorInfo(params.creatorId as string)
  return {
    props: {
      tokenData: {
        ...data,
        address: params.creatorId,
      },
    },
  }
}

export default CreatorPage
