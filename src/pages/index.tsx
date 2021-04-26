import React from "react"
import NextImage from "next/image"
import NextLink from "next/link"
import {
  Button,
  chakra,
  Container,
  Flex,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Skeleton,
  SkeletonCircle,
  StackDivider,
  Text,
  VStack,
} from "@chakra-ui/react"
import { CoinIcon } from "components/coin-icon"
import { RiSearchLine } from "react-icons/ri"
import { Header } from "components/header"
import { useVerifyAccount, useGetCreators } from "hooks"

const Image = chakra(NextImage, {
  shouldForwardProp: () => true,
})

function useSearch(data: any[]) {
  const [searchResult, setSearchResult] = React.useState(data)
  const [query, setQuery] = React.useState("")

  const onChange = (query: string) => {
    setQuery(query)
    if (query.length > 2) {
      const re = new RegExp(`.*${query}*`, "i")
      setSearchResult(data.filter((data) => re.test(data.name)))
    }
  }

  return {
    data: query.length > 2 ? searchResult : data,
    search: onChange,
    query: query,
  }
}

const Tokens: React.FC = () => {
  const { data: rawData } = useGetCreators()
  const { data, search, query } = useSearch(rawData)
  const loaded = !!rawData.length

  let Loader = Array.from({ length: 3 }).map((_, i) => (
    <Flex key={i} width="100%" align="center">
      <SkeletonCircle mr={3} boxSize="40px" />

      <Skeleton width="90px" height="24px" />

      <chakra.div alignItems="center" ml="auto" display="flex">
        <CoinIcon mr={2} />

        <Skeleton width="40px" height="24px" />
      </chakra.div>
    </Flex>
  ))

  return (
    <>
      <Skeleton isLoaded={loaded} mb={12} width="100%">
        <InputGroup size="lg">
          <Input
            border="none"
            bg="whiteAlpha.300"
            rounded="50px"
            placeholder="Search for creator"
            value={query}
            onChange={(e) => search(e.target.value)}
          />
          <InputRightElement children={<RiSearchLine />} />
        </InputGroup>
      </Skeleton>

      <VStack divider={<StackDivider opacity="0.5" bgColor="primary.700" />} spacing={5}>
        {loaded
          ? data.map((token) => (
              <NextLink key={token.symbol} href={`/creator/${token.address}`}>
                <a style={{ width: "100%" }}>
                  <Flex width="100%" align="center">
                    <Image
                      rounded="full"
                      width="40px"
                      height="40px"
                      objectFit="cover"
                      src={`/creators/${token.symbol.toLowerCase()}.jpeg`}
                      alt={token.name}
                    />

                    <Text ml={3}>{token.name}</Text>

                    <chakra.div alignItems="center" ml="auto" display="flex">
                      <CoinIcon mr={2} />
                      {token.price ? (
                        <Text>{token.price}</Text>
                      ) : (
                        <Skeleton width="40px" height="24px" />
                      )}
                    </chakra.div>
                  </Flex>
                </a>
              </NextLink>
            ))
          : Loader}
      </VStack>
    </>
  )
}

const Home: React.FC = () => {
  const verifyAccount = useVerifyAccount()

  return (
    <Container my={[4, 14]}>
      <Header />

      {/*  body */}
      <chakra.main my={10}>
        {/* header */}

        <VStack mb={24} spacing={10}>
          <Heading textAlign="center" variant="title">
            Own tokens of your favorite YouTube creators
          </Heading>
          <Heading mb={16} px={12} fontSize="lg" textAlign="center" variant="subTitle">
            Use tokens to vote for creators. Token value goes up as more people vote
          </Heading>

          {!verifyAccount.isVerified && (
            <Button
              disabled={!verifyAccount.loaded}
              onClick={verifyAccount.signIn}
              leftIcon={<CoinIcon />}
              size="lg"
              variant="primary"
            >
              50 free tokens on sign up
            </Button>
          )}
        </VStack>

        {/* creators section */}
        <VStack mx={3} align="stretch">
          <Tokens />
        </VStack>
      </chakra.main>
    </Container>
  )
}

export default Home
