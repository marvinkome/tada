import React from "react"
import {
  Button,
  chakra,
  Container,
  Divider,
  Flex,
  Heading,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  StackDivider,
  Text,
  VStack,
} from "@chakra-ui/react"
import { CoinIcon } from "components/coin-icon"
import { RiSearchLine } from "react-icons/ri"

const Home: React.FC = () => {
  return (
    <Container my={[4, 14]}>
      {/* header */}
      <Heading fontSize="2xl" textAlign="center" fontStyle="italic" textStyle="title">
        TaDa!
      </Heading>

      {/*  body */}
      <chakra.div my={10}>
        {/* header */}
        <VStack mb={24} spacing={10}>
          <Heading textAlign="center" variant="title">
            Own tokens of your favorite YouTube creators
          </Heading>

          <Heading mb={16} px={12} fontSize="lg" textAlign="center" variant="subTitle">
            Use tokens to vote for creators. Token value goes up as more people votes
          </Heading>

          <Button leftIcon={<CoinIcon />} size="lg" variant="primary">
            50 free tokens on sign up
          </Button>
        </VStack>

        {/* creators section */}
        <VStack mx={3} align="stretch">
          <InputGroup mb={12} size="lg">
            <Input
              border="none"
              bg="whiteAlpha.300"
              rounded="50px"
              placeholder="Search for creator"
            />
            <InputRightElement children={<RiSearchLine />} />
          </InputGroup>

          {/* creators list */}
          <VStack divider={<StackDivider opacity="0.5" bgColor="primary.700" />} spacing={5}>
            {Array.from({ length: 25 }).map((_, i) => (
              <Flex key={i} width="100%" align="center">
                <Image
                  rounded="full"
                  boxSize="40px"
                  objectFit="cover"
                  src="/mark-rober.jpeg"
                  alt="Mark Rober"
                  mr={3}
                />

                <Text>Mark Rober</Text>

                <Text ml="auto">
                  <CoinIcon mr={2} />
                  50
                </Text>
              </Flex>
            ))}
          </VStack>
        </VStack>
      </chakra.div>
    </Container>
  )
}

export default Home
