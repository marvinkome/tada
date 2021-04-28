import React from "react"
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
import { useAddress, useAllBalances, useImportWallet, useMnemonic } from "burner-wallet/hooks"
import { truncateAddress, truncateDecimal } from "lib/utils"

const ImportWallet: React.FC = () => {
  const toast = useToast()
  const importWallet = useImportWallet()

  const [error, setError] = React.useState("")
  const [mnemonic, setMnemonic] = React.useState("")

  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError("")
    setMnemonic(event.target.value)
  }

  const handleSubmit = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault()

    importWallet(mnemonic)
      .then(() => {
        toast({
          title: "Wallet imported",
          description: `Your wallet have been imported`,
          status: "success",
          isClosable: true,
          position: "top-right",
        })

        setMnemonic("")
      })
      .catch((err) => {
        console.log(err)
        setError("Failed to import wallet. Please check your seed phrase and try again")
      })
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

              <Button colorScheme="blue" variant="outline" type="submit">
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

const WalletPage: React.FC = () => {
  const address = useAddress()
  const addressCopy = useClipboard(address)
  const mnemonic = useMnemonic()
  const walletExport = useClipboard(mnemonic)
  const allBalance = useAllBalances()

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
              {truncateAddress(address, 10)}
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
            {walletExport.hasCopied ? "Exported!" : "Export wallet"}
          </Button>

          <ImportWallet />
        </Stack>

        {/* your tokens list */}
        <chakra.div>
          <Heading mb={10} textAlign="center" textStyle="title">
            Your Tokens
          </Heading>

          <VStack divider={<StackDivider opacity="0.5" bgColor="primary.700" />} spacing={5}>
            {Object.keys(allBalance).map((key) => (
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

                <Text ml="auto">{truncateDecimal(allBalance[key], 3)}</Text>
              </Flex>
            ))}
          </VStack>
        </chakra.div>
      </chakra.main>
    </Container>
  )
}

export default WalletPage
