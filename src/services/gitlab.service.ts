import { HttpService } from './http.service'
import { GitlabUserProfile } from '../types'
import { OAuthDataStorageService } from './oauth-data-storage.service'

export class GitlabService extends HttpService {
  private static baseUrl = 'https://gitlab.com/api/v4'

  private static storageKey = 'GLT'

  storage: OAuthDataStorageService

  constructor() {
    super(GitlabService.baseUrl)
    this.storage = new OAuthDataStorageService(GitlabService.storageKey)
  }

  getUserProfile = async () =>
    this.get<GitlabUserProfile>('/user', {
      headers: {
        Authorization: `Bearer ${this.storage.getToken()}`,
      },
    })
}
