import React from "react"
import { chakra, Flex, Heading, HStack, Text } from "@chakra-ui/react"
import { CoinIcon } from "./coin-icon"
import { IoWalletOutline } from "react-icons/io5"
import { useBalance } from "burner-wallet/hooks"

export const Header: React.FC = () => {
  const balance = useBalance("shill")

  if (!balance) {
    return (
      <Heading fontSize="2xl" textAlign="center" fontStyle="italic" textStyle="title">
        TaDa!
      </Heading>
    )
  }

  return (
    <Flex width="100%" justify="flex-end">
      <HStack spacing={3} p={2} pr={3} rounded="full" bg="accent.900" align="center">
        <CoinIcon />
        <Text pr={1}>500</Text>
        <IoWalletOutline />
      </HStack>
    </Flex>
  )
}
