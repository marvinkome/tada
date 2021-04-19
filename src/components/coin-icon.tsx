import React from "react"
import { Icon, chakra } from "@chakra-ui/react"

export const CoinIcon = chakra((props) => {
  return (
    <Icon {...props} width="20px" height="20px" viewBox="0 0 20 20" fill="none">
      <path
        d="M10 0C15.5229 0 20.0001 4.47717 20.0001 10C20.0001 15.5229 15.5229 20.0001 10 20.0001C4.47717 20.0001 0 15.5229 0 10C0 4.47717 4.47717 0 10 0Z"
        fill="#F4B844"
      />
      <path
        d="M9.99992 17.5358C14.1619 17.5358 17.5358 14.1618 17.5358 9.99989C17.5358 5.83795 14.1619 2.46402 9.99992 2.46402C5.83797 2.46402 2.46405 5.83795 2.46405 9.99989C2.46405 14.1618 5.83797 17.5358 9.99992 17.5358Z"
        fill="#FEDB41"
      />
    </Icon>
  )
})
