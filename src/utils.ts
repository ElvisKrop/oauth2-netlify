import pkg from '../package.json'
import { OAuthStorageData } from './types'

export const validateOAuthStorageData = (data: OAuthStorageData) =>
  Boolean(data.token) && !!data.version && data.version === pkg.version

export const encodeOAuthStorageData = (data: Partial<OAuthStorageData>) =>
  JSON.stringify({ version: pkg.version, ...data })
