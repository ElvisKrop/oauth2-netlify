import { HttpService } from './http.service'
import { LocalStorageService } from './local-storage.service'
import { GithubStorageData, GithubUserProfile } from '../types'
import pkg from '../../package.json'

const validateGithubStorageData = (data: GithubStorageData) =>
  Boolean(data.token) && !!data.version && data.version === pkg.version

class GithubLSService extends LocalStorageService<GithubStorageData> {
  private static LOCAL_STORAGE_KEY = 'GHT'

  constructor() {
    super(GithubLSService.LOCAL_STORAGE_KEY, validateGithubStorageData, GithubLSService.encode)
  }

  private static encode = (data: Partial<GithubStorageData>) =>
    JSON.stringify({ version: pkg.version, ...data })

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
