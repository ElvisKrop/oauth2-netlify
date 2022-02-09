import { HttpService } from './http.service';
import { LocalStorageService } from './local-storage.service';
import pkg from '../../package.json'

interface GithubStorageData {
  token: string
  version: string
}

export interface GithubUserProfile {
  login: string
  id: number
  node_id: string
  avatar_url: string
  name: string
  location: string
}

const validateGithubStorageData = (data: GithubStorageData) =>
  Boolean(data.token) && !!data.version && data.version === pkg.version

class GithubLSService extends LocalStorageService<GithubStorageData> {
  private static LOCAL_STORAGE_KEY = 'GHT'
  constructor() {
    super(GithubLSService.LOCAL_STORAGE_KEY, validateGithubStorageData, GithubLSService.encode)
  }

  private static encode = (data: Partial<GithubStorageData>) => JSON.stringify({  version: pkg.version, ...data })

  getToken = (): string => {
    const storedValue = this.getItem()
    return storedValue.token
  }

  removeStoredToken = () => this.removeItem()
}

export class GithubService extends HttpService {
  private static baseUrl = 'https://api.github.com'

  storage: GithubLSService

  constructor() {
    super(GithubService.baseUrl, { Accept: "application/vnd.github.v3+json" })
    this.storage = new GithubLSService()
  }

  getUserProfile = async () => this.get<GithubUserProfile>('/user', {
    headers: {
      Authorization: `token ${this.storage.getToken()}`
    }
  })
}
