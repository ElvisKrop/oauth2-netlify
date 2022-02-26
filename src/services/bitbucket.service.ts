import { HttpService } from './http.service'
import { BitbucketUserProfile } from '../types'
import { OAuthDataStorageService } from './oauth-data-storage.service'

export class BitbucketService extends HttpService {
  private static baseUrl = 'https://api.bitbucket.org/2.0'

  private static storageKey = 'BBT'

  storage: OAuthDataStorageService

  constructor() {
    super(BitbucketService.baseUrl, { Accept: 'application/json' })
    this.storage = new OAuthDataStorageService(BitbucketService.storageKey)
  }

  getUserProfile = async () =>
    this.get<BitbucketUserProfile>('/user', {
      headers: {
        Authorization: `Bearer ${this.storage.getToken()}`,
      },
    })
}
