import { HttpService } from './http.service'
import { LocalStorageService } from './local-storage.service'
import { OAuthStorageData, BitbucketUserProfile } from '../types'
import { encodeOAuthStorageData, validateOAuthStorageData } from '../utils'

class BitbucketLSService extends LocalStorageService<OAuthStorageData> {
  private static LOCAL_STORAGE_KEY = 'BBT'

  constructor() {
    super(BitbucketLSService.LOCAL_STORAGE_KEY, validateOAuthStorageData, encodeOAuthStorageData)
  }

  getToken = (): string => this.getItem().token

  setToken = (token: string): void => this.setItem({ token })

  isStoredTokenValid = () => this.isStoredValueValid()

  removeStoredToken = (): void => this.removeItem()
}

export class BitbucketService extends HttpService {
  private static baseUrl = 'https://api.bitbucket.org/2.0'

  storage: BitbucketLSService

  constructor() {
    super(BitbucketService.baseUrl, { Accept: 'application/json' })
    this.storage = new BitbucketLSService()
  }

  getUserProfile = async () =>
    this.get<BitbucketUserProfile>('/user', {
      headers: {
        Authorization: `Bearer ${this.storage.getToken()}`,
      },
    })
}
