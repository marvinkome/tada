import React from "react"
import {
  Button,
  chakra,
  Container,
  Flex,
  Heading,
  Image,
  StackDivider,
  Text,
  VStack,
} from "@chakra-ui/react"
import { Header } from "components/header"
import { FiCopy } from "react-icons/fi"
import { CoinIcon } from "components/coin-icon"

const WalletPage: React.FC = () => {
  return (
    <Container my={[4, 14]}>
      <Header />

      {/* body */}
      <chakra.main my={10} mx={3}>
        {/* wallet box */}
        <chakra.div
          py={3}
          px={8}
          mb={20}
          bgColor="accent.900"
          rounded="20px"
          shadow="0px 3px 10px rgba(255, 255, 255, 0.25)"
        >
          <Text mb={7}>Wallet address</Text>

          <chakra.div textAlign="center">
            <Text mb={3}>0x24451bfc193...D49b69BF6b</Text>
            <Button rounded="xl" rightIcon={<FiCopy />} variant="outline">
              Copy
            </Button>
          </chakra.div>
        </chakra.div>

        {/* your tokens list */}
        <chakra.div>
          <Heading mb={10} textAlign="center" textStyle="title">
            Your Tokens
          </Heading>

          <VStack divider={<StackDivider opacity="0.5" bgColor="primary.700" />} spacing={5}>
            <Flex width="100%" align="center">
              <CoinIcon boxSize="40px" mr={6} />

              <Text>SHILL</Text>

              <Text ml="auto">50</Text>
            </Flex>

            <Flex width="100%" align="center">
              <Image
                rounded="full"
                boxSize="40px"
                objectFit="cover"
                src="/mark-rober.jpeg"
                alt="Mark Rober"
                mr={6}
              />

              <Text>Mark Rober</Text>

              <Text ml="auto">10</Text>
            </Flex>
          </VStack>
        </chakra.div>
      </chakra.main>
    </Container>
  )
}

export default WalletPage
