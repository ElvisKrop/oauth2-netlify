import { HttpService } from './http.service'
import { LocalStorageService } from './local-storage.service'
import { OAuthStorageData, GithubUserProfile } from '../types'
import { encodeOAuthStorageData, validateOAuthStorageData } from '../utils'

class GithubLSService extends LocalStorageService<OAuthStorageData> {
  private static LOCAL_STORAGE_KEY = 'GHT'

  constructor() {
    super(GithubLSService.LOCAL_STORAGE_KEY, validateOAuthStorageData, encodeOAuthStorageData)
  }

  getToken = (): string => this.getItem().token

  setToken = (token: string): void => this.setItem({ token })

  isStoredTokenValid = () => this.isStoredValueValid()

  removeStoredToken = (): void => this.removeItem()
}

export class GithubService extends HttpService {
  private static baseUrl = 'https://api.github.com'

  storage: GithubLSService

  constructor() {
    super(GithubService.baseUrl, { Accept: 'application/vnd.github.v3+json' })
    this.storage = new GithubLSService()
  }

  getUserProfile = async () =>
    this.get<GithubUserProfile>('/user', {
      headers: {
        Authorization: `token ${this.storage.getToken()}`,
      },
    })
}
