import React from "react"
import {
  chakra,
  Container,
  Image,
  Heading,
  Text,
  VStack,
  HStack,
  Input,
  Button,
} from "@chakra-ui/react"
import { Header } from "components/header"
import { CoinIcon } from "components/coin-icon"

const CreatorPage: React.FC = () => {
  return (
    <Container my={[4, 14]}>
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
        <VStack mb={10} spacing={10} align="stretch">
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

            <Text>0</Text>
          </chakra.div>
        </VStack>

        {/* token actions */}
        <chakra.div>
          <Input mb={10} rounded="xl" size="lg" placeholder="Enter amount" />

          <VStack spacing={2}>
            <Button size="lg" variant="primary" isFullWidth>
              Buy Tokens
            </Button>

            <Text>OR</Text>

            <Button isDisabled size="lg" variant="secondary" isFullWidth>
              Sell Tokens
            </Button>
          </VStack>
        </chakra.div>
      </chakra.main>
    </Container>
  )
}

export default CreatorPage
