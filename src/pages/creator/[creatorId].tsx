import React from "react"
import NextImage from "next/image"
import {
  chakra,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Input,
  Button,
  SkeletonCircle,
  Skeleton,
} from "@chakra-ui/react"
import { Header } from "components/header"
import { CoinIcon } from "components/coin-icon"
import { useGetCreatorData } from "hooks"
import { useBalance } from "burner-wallet/hooks"

const Image = chakra(NextImage, {
  shouldForwardProp: () => true,
})

const CreatorPage: React.FC = () => {
  const { data } = useGetCreatorData()
  const balance = useBalance(data?.symbol || "")

  return (
    <Container my={[4, 14]}>
      <Header />

      {/*  body */}
      <chakra.main my={10} mx={3}>
        {/* header */}
        <VStack mb={16} spacing={7}>
          {data?.symbol ? (
            <Image
              rounded="full"
              width="150px"
              height="150px"
              objectFit="cover"
              src={`/creators/${data.symbol.toLowerCase()}.jpeg`}
              alt={data.name}
            />
          ) : (
            <SkeletonCircle boxSize="150px" />
          )}

          {data?.name ? (
            <Heading variant="title">{data.name}</Heading>
          ) : (
            <Skeleton width="200px" height="47px" />
          )}
        </VStack>

        {/* token info */}
        <VStack mb={10} spacing={10} align="stretch">
          <chakra.div>
            <Heading mb={2} fontSize="lg" variant="subTitle">
              Token Price
            </Heading>

            <HStack>
              <CoinIcon mr={2} />

              {data?.price ? <Text>{data.price}</Text> : <Skeleton width="40px" height="24px" />}
            </HStack>
          </chakra.div>

          <chakra.div>
            <Heading mb={2} fontSize="lg" variant="subTitle">
              You own
            </Heading>

            {balance === 0 || !!balance ? (
              <Text>{balance}</Text>
            ) : (
              <Skeleton width="40px" height="24px" />
            )}
          </chakra.div>
        </VStack>

        {/* token actions */}
        <chakra.div mb={20}>
          <Input
            disabled={!data?.symbol}
            mb={10}
            rounded="xl"
            size="lg"
            placeholder="Enter amount"
          />

          <VStack spacing={2}>
            <Button isDisabled={!data?.symbol} size="lg" variant="primary" isFullWidth>
              Buy Tokens
            </Button>

            <Text>OR</Text>

            <Button
              isDisabled={!data?.symbol || balance === 0}
              size="lg"
              variant="secondary"
              isFullWidth
            >
              Sell Tokens
            </Button>
          </VStack>
        </chakra.div>
      </chakra.main>
    </Container>
  )
}

export default CreatorPage
