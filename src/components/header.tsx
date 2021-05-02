import React from "react"
import NextLink from "next/link"
import { Flex, Heading, HStack, Text } from "@chakra-ui/react"
import { CoinIcon } from "./coin-icon"
import { IoWalletOutline } from "react-icons/io5"
import { useBalance } from "burner-wallet/hooks"
import { truncateDecimal } from "lib/utils"

export const Header: React.FC = () => {
  const balance = useBalance("shill")

  return (
    <Flex width="100%" justify="space-between">
      <NextLink href="/">
        <a>
          <Heading fontSize="2xl" textAlign="center" fontStyle="italic" textStyle="title">
            TaDa!
          </Heading>
        </a>
      </NextLink>

      <NextLink href="/wallet">
        <a>
          <HStack spacing={3} p={2} pr={3} rounded="full" bg="accent.900" align="center">
            <CoinIcon />
            <Text pr={1}>{truncateDecimal(balance, 2)}</Text>
            <IoWalletOutline />
          </HStack>
        </a>
      </NextLink>
    </Flex>
  )
}
