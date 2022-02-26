import { LocalStorageService } from './local-storage.service'
import { OAuthStorageData } from '../types'
import { encodeOAuthStorageData, validateOAuthStorageData } from '../utils'

export class OAuthDataStorageService extends LocalStorageService<OAuthStorageData> {
  constructor(private storageKey: string) {
    super(storageKey, validateOAuthStorageData, encodeOAuthStorageData)
  }

  getToken = (): string => this.getItem().token

  setToken = (token: string): void => this.setItem({ token })

  isStoredTokenValid = () => this.isStoredValueValid()

  removeStoredToken = (): void => this.removeItem()
}
