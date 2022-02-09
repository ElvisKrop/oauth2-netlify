import netlify from 'netlify-auth-providers'

export enum NetlifyOAuthProvider {
  github = 'github',
  gitlab = 'gitlab',
  bitbucket = 'bitbucket',
}

interface GithubOAuthResponse {
  provider: NetlifyOAuthProvider
  token: string
}

export class NetlifyService extends netlify {
  private static instances: Record<string, NetlifyService> = {}

  private constructor(private siteId?: string, private baseUrl?: string) {
    super({ site_id: siteId, base_url: baseUrl })
  }

  static getInstance = (siteId: string, baseUrl?: string) => {
    if (!NetlifyService.instances[siteId]) {
      NetlifyService.instances[siteId] = new NetlifyService(siteId, baseUrl)
    }
    return NetlifyService.instances[siteId]
  }

  auth = (provider: NetlifyOAuthProvider, scope?: string): Promise<string> =>
    new Promise((resolve, reject) =>
      this.authenticate({ provider, scope }, (error, data: GithubOAuthResponse) =>
        error ? reject(error) : resolve(data.token),
      ),
    )
}
