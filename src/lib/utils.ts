import { abbreviateNumber } from "js-abbreviation-number"

export function truncateAddress(address: string, length: number): string {
  return `${address.substring(0, length + 2)}...${address.substring(
    address.length - length,
    address.length
  )}`
}

export function truncateDecimal(str: string, maxDecimalDigits: number) {
  let res = (+str).toFixed(maxDecimalDigits)

  // @ts-ignore
  if (isNaN(res) || +res <= 0) {
    res = "0"
  }

  // abbr number
  if (+res < 1000) return res
  return abbreviateNumber(parseFloat(res), maxDecimalDigits)
}
