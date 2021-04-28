import React from "react"
import NextImage from "next/image"
import _debounce from "lodash.debounce"
import { GetStaticPaths, GetStaticProps } from "next"
import { getCreatorInfo, getCreators, getCreatorTokenContract, getTokenBuyPrice } from "ethereum"
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
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
} from "@chakra-ui/react"
import { Header } from "components/header"
import { CoinIcon } from "components/coin-icon"
import { useBalance } from "burner-wallet/hooks"
import { truncateDecimal } from "lib/utils"
import { useBuyToken, useSellToken, useUpdateCreatorBalance } from "hooks"

const Image = chakra(NextImage, {
  shouldForwardProp: () => true,
})

function useTokenAmount(address: string) {
  const contract = getCreatorTokenContract(address)
  const [amount, setAmount] = React.useState("")
  const [buyPrice, setBuyPrice] = React.useState("")
  const [sellPrice, setSellPrice] = React.useState("")

  const getBuyPrice = _debounce(async (amount) => {
    if (!amount.length || parseInt(amount, 10) < 0) return

    const price = await getTokenBuyPrice(contract, amount)
    setBuyPrice(price)
  }, 1000)

  const getSellPrice = _debounce(async (amount) => {
    if (!amount.length || parseInt(amount, 10) < 0) return

    const price = await getTokenBuyPrice(contract, amount)
    setSellPrice(price)
  }, 1000)

  const onChange = async (amount: string) => {
    setAmount(amount)

    await Promise.all([getBuyPrice(amount), getSellPrice(amount)])
  }

  return {
    amount,
    buyPrice,
    sellPrice,

    onChange,
  }
}

function useTokenPrice(address: string, initialPrice: string) {
  const contract = getCreatorTokenContract(address)
  const [price, setPrice] = React.useState(initialPrice)

  const updatePrice = React.useCallback(async () => {
    const price = await getTokenBuyPrice(contract, "1")
    setPrice(price)
  }, [])

  return { price, updatePrice }
}

const BuyToken: React.FC<{
  symbol: string
  address: string
  amount: string
  buyPrice: string
  onPurchase: () => void
}> = ({ symbol, address, amount, buyPrice, onPurchase }) => {
  const [isBuying, setIsBuying] = React.useState(false)
  const { onOpen, onClose, isOpen } = useDisclosure()
  const cancelRef = React.useRef()
  const buyTokens = useBuyToken({ symbol, address })

  const onConfirm = async () => {
    onClose()
    setIsBuying(true)

    await buyTokens(buyPrice)

    setIsBuying(false)
    onPurchase()
  }

  return (
    <>
      <Button isLoading={isBuying} onClick={onOpen} size="lg" variant="primary" isFullWidth>
        Buy Tokens
      </Button>

      <AlertDialog
        isCentered
        size="lg"
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Buy {symbol} tokens
            </AlertDialogHeader>

            <AlertDialogBody>
              <Text mb={5}>
                Buy {amount} {symbol} tokens for {truncateDecimal(buyPrice, 2)} SHILL?
              </Text>

              <Text fontSize="smaller">This includes slippage</Text>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>

              <Button colorScheme="primary" onClick={onConfirm} ml={3}>
                Confirm
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  )
}

const SellToken: React.FC<{
  symbol: string
  address: string
  balance: string
  amount: string
  sellPrice: string
  onSell: () => void
}> = ({ symbol, address, balance, amount, sellPrice, onSell }) => {
  const [isSelling, setIsSelling] = React.useState(false)
  const { onOpen, onClose, isOpen } = useDisclosure()
  const cancelRef = React.useRef()
  const sellTokens = useSellToken({ symbol, address })

  const onConfirm = async () => {
    onClose()
    setIsSelling(true)

    await sellTokens(amount)

    setIsSelling(false)
    onSell()
  }

  return (
    <>
      <Button
        isFullWidth
        size="lg"
        variant="secondary"
        onClick={onOpen}
        isLoading={isSelling}
        isDisabled={!balance || balance === "0"}
      >
        Sell Tokens
      </Button>

      <AlertDialog
        isCentered
        size="lg"
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Sell {symbol} tokens
            </AlertDialogHeader>

            <AlertDialogBody>
              <Text mb={5}>
                Sell {amount} {symbol} tokens for {truncateDecimal(sellPrice, 2)} SHILL?
              </Text>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>

              <Button colorScheme="primary" onClick={onConfirm} ml={3}>
                Confirm
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  )
}

const CreatorPage: React.FC<{
  price: string
  symbol: string
  address: string
  name: string
}> = ({ price: initialPrice, symbol, address, name }) => {
  const { price, updatePrice } = useTokenPrice(address, initialPrice)
  const { wallet, updateCreatorBalance } = useUpdateCreatorBalance({ address, symbol })
  const { amount, buyPrice, sellPrice, onChange } = useTokenAmount(address)
  const balance = useBalance(symbol)

  React.useEffect(() => {
    updateCreatorBalance()
  }, [wallet])

  const onTokenAction = async () => {
    onChange("")
    await updatePrice()
  }

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
            src={`/creators/${symbol.toLowerCase()}.jpeg`}
            alt={name}
          />

          <Heading variant="title">{name}</Heading>
        </VStack>

        {/* token info */}
        <VStack mb={10} spacing={10} align="stretch">
          <chakra.div>
            <Heading mb={2} fontSize="lg" variant="subTitle">
              Token Price
            </Heading>

            <HStack>
              <CoinIcon mr={2} />

              <Text>{truncateDecimal(price, 2)}</Text>
            </HStack>
          </chakra.div>

          <chakra.div>
            <Heading mb={2} fontSize="lg" variant="subTitle">
              You own
            </Heading>

            {balance === "0" || !!balance ? (
              <Text>{truncateDecimal(balance, 2)}</Text>
            ) : (
              <Skeleton width="40px" height="24px" />
            )}
          </chakra.div>
        </VStack>

        {/* token actions */}
        <chakra.div mb={20}>
          <Input
            mb={10}
            rounded="xl"
            size="lg"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => onChange(e.target.value)}
          />

          <VStack spacing={2}>
            <BuyToken
              symbol={symbol}
              address={address}
              amount={amount}
              buyPrice={buyPrice}
              onPurchase={onTokenAction}
            />

            <Text>OR</Text>

            <SellToken
              balance={balance}
              address={address}
              symbol={symbol}
              amount={amount}
              sellPrice={sellPrice}
              onSell={onTokenAction}
            />
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
      ...data,
      address: params.creatorId,
    },
  }
}

export default CreatorPage
