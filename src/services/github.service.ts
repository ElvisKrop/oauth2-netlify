import { HttpService } from './http.service'
import { GithubUserProfile } from '../types'
import { OAuthDataStorageService } from './oauth-data-storage.service'

export class GithubService extends HttpService {
  private static baseUrl = 'https://api.github.com'

  private static storageKey = 'GHT'

  storage: OAuthDataStorageService

  constructor() {
    super(GithubService.baseUrl, { Accept: 'application/vnd.github.v3+json' })
    this.storage = new OAuthDataStorageService(GithubService.storageKey)
  }

  getUserProfile = async () =>
    this.get<GithubUserProfile>('/user', {
      headers: {
        Authorization: `token ${this.storage.getToken()}`,
      },
    })
}
