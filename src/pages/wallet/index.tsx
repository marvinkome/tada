import React from "react"
import NextLink from "next/link"
import { GetStaticProps } from "next"
import {
  Button,
  chakra,
  Container,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Skeleton,
  SkeletonCircle,
  Stack,
  StackDivider,
  Text,
  useClipboard,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react"
import { Header } from "components/header"
import { FiCopy } from "react-icons/fi"
import { CoinIcon } from "components/coin-icon"
import {
  useAddress,
  useAllBalances,
  useGetTokenAddress,
  useImportWallet,
  useMnemonic,
} from "burner-wallet/hooks"
import { truncateAddress, truncateDecimal } from "lib/utils"
import { getCreators } from "ethereum"
import { useUpdateAllCreatorBalance } from "hooks"

const ImportWallet: React.FC = () => {
  const toast = useToast()
  const importWallet = useImportWallet()

  const [error, setError] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [mnemonic, setMnemonic] = React.useState("")

  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError("")
    setMnemonic(event.target.value)
  }

  const handleSubmit = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault()

    setLoading(true)

    try {
      await importWallet(mnemonic)
      toast({
        title: "Wallet imported",
        description: `Your wallet has been imported`,
        status: "success",
        isClosable: true,
        position: "top-right",
      })

      setMnemonic("")
      onClose()
    } catch (e) {
      console.log(e)
      setError("Failed to import wallet. Please check your seed phrase and try again")
    }
    setLoading(false)
  }

  return (
    <>
      <Button
        onClick={onOpen}
        isFullWidth
        rounded="full"
        colorScheme="white"
        size="lg"
        variant="outline"
      >
        Import wallet
      </Button>

      <Modal isCentered isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Import Wallet</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleSubmit}>
              <FormControl isInvalid={!!error} mb={5} id="importWallet">
                <FormLabel>Import Wallet</FormLabel>
                <Input
                  onChange={handleChange}
                  value={mnemonic}
                  size="lg"
                  placeholder="Your seed phrase"
                  type="text"
                />
                <FormErrorMessage>{error}</FormErrorMessage>
              </FormControl>

              <Button isLoading={loading} colorScheme="blue" variant="outline" type="submit">
                Import wallet
              </Button>
            </form>
          </ModalBody>

          <ModalFooter />
        </ModalContent>
      </Modal>
    </>
  )
}

const WalletPage: React.FC<{ tokens: any[] }> = ({ tokens }) => {
  const getTokenAddress = useGetTokenAddress()
  const updateInfo = useUpdateAllCreatorBalance(tokens)

  const address = useAddress()
  const addressCopy = useClipboard(address)

  const mnemonic = useMnemonic()
  const walletExport = useClipboard(mnemonic)

  const allBalance = useAllBalances()

  React.useEffect(() => {
    updateInfo.updateAllCreatorBalance()
  }, [updateInfo.wallet])

  return (
    <Container my={[4, 14]}>
      <Header />

      {/* body */}
      <chakra.main my={10} mx={3}>
        {/* wallet box */}
        <chakra.div
          py={3}
          px={8}
          mb={10}
          bgColor="accent.900"
          rounded="20px"
          shadow="0px 3px 10px rgba(255, 255, 255, 0.25)"
        >
          <Text mb={7}>Wallet address</Text>

          <chakra.div textAlign="center">
            <Text fontSize="lg" mb={3}>
              {truncateAddress(address || "", 10)}
            </Text>
            <Button
              onClick={addressCopy.onCopy}
              rounded="xl"
              rightIcon={<FiCopy />}
              variant="outline"
            >
              {addressCopy.hasCopied ? "Copied" : "Copy"}
            </Button>
          </chakra.div>
        </chakra.div>

        {/* token settings */}
        <Stack direction={["column", "row"]} mb={20} spacing={7}>
          <Button
            onClick={walletExport.onCopy}
            isFullWidth
            rounded="full"
            colorScheme="white"
            size="lg"
            variant="outline"
          >
            {walletExport.hasCopied ? "Seed phrase copied!" : "Export wallet"}
          </Button>

          <ImportWallet />
        </Stack>

        {/* your tokens list */}
        <chakra.div>
          <Heading mb={10} textAlign="center" textStyle="title">
            Your Tokens
          </Heading>

          <VStack divider={<StackDivider opacity="0.5" bgColor="primary.700" />} spacing={5}>
            {Object.keys(allBalance)
              .filter((key) => parseFloat(allBalance[key]))
              .map((key) => (
                <NextLink key={key} href={`/wallet/${getTokenAddress(key)}`}>
                  <a style={{ width: "100%" }}>
                    <Flex key={key} width="100%" align="center">
                      {key === "shill" ? (
                        <CoinIcon boxSize="40px" mr={6} />
                      ) : (
                        <Image
                          rounded="full"
                          boxSize="40px"
                          objectFit="cover"
                          src={`/creators/${key.toLowerCase()}.jpeg`}
                          alt={key}
                          mr={6}
                        />
                      )}

                      <Text>{key.toUpperCase()}</Text>

                      <Text ml="auto">{truncateDecimal(allBalance[key], 2)}</Text>
                    </Flex>
                  </a>
                </NextLink>
              ))}

            {updateInfo.isLoadingAllBalances &&
              Array.from({ length: 2 }).map((_, idx) => (
                <Flex key={idx} width="100%" align="center">
                  <SkeletonCircle width="40px" height="40px" mr={6} />

                  <Skeleton width="50px" height="24px" />

                  <Skeleton ml="auto" width="35px" height="24px" />
                </Flex>
              ))}
          </VStack>
        </chakra.div>
      </chakra.main>
    </Container>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  // fetch all tokens without price
  const tokenData = await getCreators()
  const tokens = tokenData.map((token: any) => ({
    address: token.creatorToken,
    symbol: token.tokenSymbol,
    name: token.tokenName,
  }))

  return { props: { tokens } }
}

export default WalletPage
