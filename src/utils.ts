import pkg from '../package.json'
import { OAuthStorageData } from './types'

export const validateOAuthStorageData = (data: OAuthStorageData) =>
  Boolean(data.token) && !!data.version && data.version === pkg.version

export const encodeOAuthStorageData = (data: Partial<OAuthStorageData>) =>
  JSON.stringify({ version: pkg.version, ...data })

export const isLocalhost = () =>
  Boolean(
    window.location.hostname === 'localhost' ||
      // [::1] is the IPv6 localhost address.
      window.location.hostname === '[::1]' ||
      // 127.0.0.0/8 are considered localhost for IPv4.
      window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/),
  )
