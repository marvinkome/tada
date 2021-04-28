export function truncateAddress(address: string, length: number): string {
  return `${address.substring(0, length + 2)}...${address.substring(
    address.length - length,
    address.length
  )}`
}

export function truncateDecimal(str: string, maxDecimalDigits: number) {
  const res = (+str).toFixed(maxDecimalDigits)

  // @ts-ignore
  if (isNaN(res)) return "0"

  return res
}
