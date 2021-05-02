import { NextPageContext } from "next"
import nextCookies from "next-cookies"
import Cookies from "js-cookie"

export const STORAGE_NAME = "TADA"

export interface ICookie {
  address: string | null
}

export interface ILocalStorage {
  mnemonic: string | null
}

function fromBase64(s: string) {
  const stringifiedCookie = Buffer.from(s || "", "base64").toString()
  const asObject = JSON.parse(stringifiedCookie || "{}")

  return asObject
}

export function toBase64(o: ICookie | ILocalStorage): string {
  const stringified = JSON.stringify(o || {})
  const base64 = Buffer.from(stringified).toString("base64")
  return base64
}

export function getAddressFromCookie(serverSide: boolean, context?: NextPageContext) {
  const cookie = serverSide ? nextCookies(context)[STORAGE_NAME] : Cookies.get(STORAGE_NAME)
  const { address } = fromBase64(cookie) as ICookie

  return address
}

export function getAccountFromLocalStorage() {
  const { mnemonic } = fromBase64(window.localStorage.getItem(STORAGE_NAME)) as ILocalStorage
  return mnemonic
}
