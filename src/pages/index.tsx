import React from "react"
import NextLink from "next/link"
import { GetStaticProps } from "next"
import { getCreators } from "ethereum"
import {
  Button,
  chakra,
  Container,
  Flex,
  Heading,
  Input,
  Image,
  InputGroup,
  InputRightElement,
  Skeleton,
  StackDivider,
  Text,
  VStack,
} from "@chakra-ui/react"
import { CoinIcon } from "components/coin-icon"
import { RiSearchLine } from "react-icons/ri"
import { Header } from "components/header"
import { useGetCreatorsPrice, useVerifyAccount } from "hooks"
import { truncateDecimal } from "lib/utils"

type Token = { address: string; symbol: string; name: string }

function useSearch(data: any[]) {
  const [searchResult, setSearchResult] = React.useState(data)
  const [query, setQuery] = React.useState("")

  const onChange = (q: string) => {
    setQuery(q)

    if (q.length) {
      const re = new RegExp(`.*${q}*`, "i")
      setSearchResult(data.filter((data) => re.test(data.name)))
    }
  }

  return {
    data: query.length ? searchResult : data,
    search: onChange,
    query: query,
  }
}

const Home: React.FC<{ tokens: Token[] }> = ({ tokens: _tokens }) => {
  const { data: tokens } = useGetCreatorsPrice(_tokens)
  const { data, search, query } = useSearch(tokens)
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
          <InputGroup mb={12} size="lg">
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

          <VStack divider={<StackDivider opacity="0.5" bgColor="primary.700" />} spacing={5}>
            {data.map((token) => (
              <NextLink key={token.symbol} href={`/creator/${token.address}`}>
                <a style={{ width: "100%" }}>
                  <Flex width="100%" align="center">
                    <Image
                      rounded="full"
                      boxSize="40px"
                      objectFit="cover"
                      src={`/creators/${token.symbol.toLowerCase()}.jpeg`}
                      alt={token.name}
                    />

                    <Text ml={3}>{token.name}</Text>

                    <chakra.div alignItems="center" ml="auto" display="flex">
                      <CoinIcon mr={2} />
                      {token.price ? (
                        <Text>{truncateDecimal(token.price, 2)}</Text>
                      ) : (
                        <Skeleton width="40px" height="24px" />
                      )}
                    </chakra.div>
                  </Flex>
                </a>
              </NextLink>
            ))}
          </VStack>
        </VStack>
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

export default Home
