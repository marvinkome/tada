import React from "react"
import addresses from "ethereum/contracts/contract-address.json"
import { GetStaticPaths, GetStaticProps } from "next"
import {
  Button,
  chakra,
  Container,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  Image,
  Input,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react"
import { Header } from "components/header"
import { CoinIcon } from "components/coin-icon"
import { getCreatorInfo, getCreators } from "ethereum"
import { useBalance, useTransferTokens } from "burner-wallet/hooks"
import { truncateDecimal } from "lib/utils"

const TokenPage: React.FC<{
  isShill: boolean
  price: string
  symbol: string
  name: string
  address: string
}> = (props) => {
  const toast = useToast()
  const balance = useBalance(props.symbol)
  const transferTokens = useTransferTokens(props.symbol)

  const [formState, setFormState] = React.useState({
    sending: false,
    error: "",
  })

  const [receiver, setReceiver] = React.useState("")
  const [amount, setAmount] = React.useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setFormState({ ...formState, sending: true })
    try {
      if (parseFloat(amount) < 0) throw Error("Please specify amount")

      await transferTokens(amount, receiver)
    } catch (err) {
      setFormState({ ...formState, error: err.message })
    }

    setFormState({ ...formState, sending: false })
    setAmount("")
    setReceiver("")

    toast({
      title: "Transfer Successful",
      description: `${amount} ${props.symbol} has been sent to ${receiver}`,
      status: "success",
      isClosable: true,
      position: "top-right",
    })
  }

  return (
    <Container my={[5, 14]}>
      <Header />

      {/*  body */}
      <chakra.main my={10} mx={3}>
        {/* header */}
        <VStack mb={16} spacing={7}>
          {props.isShill ? (
            <CoinIcon boxSize="150px" />
          ) : (
            <Image
              rounded="full"
              boxSize="150px"
              objectFit="cover"
              src={`/creators/${props.symbol}.jpeg`}
              alt={props.name}
            />
          )}

          <Heading variant="title">{props.name}</Heading>
        </VStack>

        {/* token info */}
        <VStack mb={16} spacing={10} align="stretch">
          <chakra.div>
            <Heading mb={2} fontSize="lg" variant="subTitle">
              Token Price
            </Heading>

            <HStack>
              <CoinIcon mr={2} />
              <Text>{truncateDecimal(props.price, 2)}</Text>
            </HStack>
          </chakra.div>

          <chakra.div>
            <Heading mb={2} fontSize="lg" variant="subTitle">
              You own
            </Heading>

            <Text>{truncateDecimal(balance, 2)}</Text>
          </chakra.div>
        </VStack>

        {/* token actions */}
        <chakra.form onSubmit={handleSubmit}>
          <VStack spacing={5}>
            <FormControl isRequired id="address" isInvalid={!!formState.error}>
              <FormLabel mb={3}>Address</FormLabel>
              <Input
                rounded="xl"
                size="lg"
                type="text"
                placeholder="Receiver's address"
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
              />
            </FormControl>

            <FormControl isRequired id="amount" isInvalid={!!formState.error}>
              <FormLabel mb={3}>Amount</FormLabel>
              <Input
                rounded="xl"
                size="lg"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <FormErrorMessage>{formState.error}</FormErrorMessage>
            </FormControl>

            <Button
              isFullWidth
              size="lg"
              variant="primary"
              type="submit"
              isLoading={formState.sending}
            >
              Transfer Tokens
            </Button>
          </VStack>
        </chakra.form>
      </chakra.main>
    </Container>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const tokenData = await getCreators()

  const paths = tokenData.map((token: any) => ({
    params: { token: token.creatorToken },
  }))

  // push shill token also
  paths.push({
    params: { token: addresses.ShillToken },
  })

  return { paths, fallback: false }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  if (params.token === addresses.ShillToken) {
    return {
      props: {
        address: params.token,
        name: "Shill",
        symbol: "shill",
        price: "1",

        isShill: true,
      },
    }
  }

  // fetch token info
  const { contract, ...data } = await getCreatorInfo(params.token as string)
  return {
    props: {
      ...data,

      address: params.token,
      isShill: false,
    },
  }
}

export default TokenPage
