export function truncateAddress(address: string, length: number): string {
  return `${address.substring(0, length + 2)}...${address.substring(
    address.length - length,
    address.length
  )}`
}

export function truncateDecimal(str: string, maxDecimalDigits: number) {
  return (+str).toFixed(maxDecimalDigits)
}
