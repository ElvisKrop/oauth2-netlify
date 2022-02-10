import { HttpService } from './http.service'
import { LocalStorageService } from './local-storage.service'
import { GitlabUserProfile, OAuthStorageData } from '../types'
import { encodeOAuthStorageData, validateOAuthStorageData } from '../utils'

class GitlabLSService extends LocalStorageService<OAuthStorageData> {
  private static LOCAL_STORAGE_KEY = 'GLT'

  constructor() {
    super(GitlabLSService.LOCAL_STORAGE_KEY, validateOAuthStorageData, encodeOAuthStorageData)
  }

  getToken = (): string => this.getItem().token

  setToken = (token: string): void => this.setItem({ token })

  isStoredTokenValid = () => this.isStoredValueValid()

  removeStoredToken = (): void => this.removeItem()
}

export class GitlabService extends HttpService {
  private static baseUrl = 'https://gitlab.com/api/v4'

  storage: GitlabLSService

  constructor() {
    super(GitlabService.baseUrl)
    this.storage = new GitlabLSService()
  }

  getUserProfile = async () =>
    this.get<GitlabUserProfile>('/user', {
      headers: {
        Authorization: `Bearer ${this.storage.getToken()}`,
      },
    })
}
