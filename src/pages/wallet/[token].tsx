import React from "react"
import {
  Button,
  chakra,
  Container,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Image,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react"
import { Header } from "components/header"
import { CoinIcon } from "components/coin-icon"

const TokenPage: React.FC = () => {
  return (
    <Container my={[5, 14]}>
      <Header />

      {/*  body */}
      <chakra.main my={10} mx={3}>
        {/* header */}
        <VStack mb={16} spacing={7}>
          <Image
            rounded="full"
            boxSize="150px"
            objectFit="cover"
            src="/mark-rober.jpeg"
            alt="Mark Rober"
          />

          <Heading variant="title">Mark Rober</Heading>
        </VStack>

        {/* token info */}
        <VStack mb={16} spacing={10} align="stretch">
          <chakra.div>
            <Heading mb={2} fontSize="lg" variant="subTitle">
              Token Price
            </Heading>

            <HStack>
              <CoinIcon mr={2} />
              <Text>41</Text>
            </HStack>
          </chakra.div>

          <chakra.div>
            <Heading mb={2} fontSize="lg" variant="subTitle">
              You own
            </Heading>

            <Text>1</Text>
          </chakra.div>
        </VStack>

        {/* token actions */}
        <chakra.form>
          <VStack spacing={8}>
            <FormControl id="address">
              <FormLabel mb={5}>Address</FormLabel>
              <Input rounded="xl" size="lg" type="text" placeholder="Receiver's address" />
            </FormControl>

            <FormControl id="amount">
              <FormLabel mb={5}>Amount</FormLabel>
              <Input rounded="xl" size="lg" type="number" placeholder="Enter amount" />
            </FormControl>

            <Button isFullWidth size="lg" variant="primary">
              Transfer Tokens
            </Button>
          </VStack>
        </chakra.form>
      </chakra.main>
    </Container>
  )
}

export default TokenPage
