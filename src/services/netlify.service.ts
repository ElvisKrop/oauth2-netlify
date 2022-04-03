import { NetlifyOAuthProvider } from '../enums'
import { NetlifyOAuthResponse } from '../types'
import { isLocalhost } from '../utils'

interface WindowParams {
  width: number
  height: number
}

enum NetlifyErrorMsg {
  noProvider = 'You must specify a provider when calling NetlifyService.authenticate',
  noSiteIdForLocalhost = 'You must set a siteId with new NetlifyService("your-site-id") to make authentication work from localhost',
}

type AuthCallback = (error: NetlifyError | null, data?: NetlifyOAuthResponse) => void

interface AuthOptions {
  provider: NetlifyOAuthProvider
  scope?: string
  login?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  beta_invite?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  invite_code?: any
}

class NetlifyError {
  constructor(public err: { message: string }) {}

  toString = () => this.err && this.err.message
}

const PROVIDERS: Record<NetlifyOAuthProvider, WindowParams> = {
  github: {
    width: 960,
    height: 700,
  },
  gitlab: {
    width: 960,
    height: 700,
  },
  bitbucket: {
    width: 640,
    height: 500,
  },
  // email: {
  //   width: 500,
  //   height: 400,
  // },
}

export class NetlifyService {
  private static DEFAULT_NETLIFY_API_URL = 'https://api.netlify.com'

  private authWindow?: WindowProxy | null

  private readonly siteId?: string | null

  constructor(
    _siteId?: string,
    private readonly baseUrl: string = NetlifyService.DEFAULT_NETLIFY_API_URL,
  ) {
    this.siteId = _siteId ? _siteId : !isLocalhost() ? window.location.hostname : null
  }

  protected getAuthWindowURL = (options: AuthOptions) => {
    const queryParams = new URLSearchParams({
      provider: options.provider,
      site_id: this.siteId,
      ...(options?.scope && { scope: options.scope }),
      ...(options?.login === true && { login: 'true' }),
      ...(options?.beta_invite && { beta_invite: options.beta_invite }),
      ...(options?.invite_code && { invite_code: options.invite_code }),
    })

    return `${this.baseUrl}/auth?${queryParams.toString()}`
  }

  protected getAuthWindowFeatures = (provider: NetlifyOAuthProvider) => {
    const windowConfig = PROVIDERS[provider] || PROVIDERS.github
    const left = (window.screen.width - windowConfig.width) / 2
    const top = (window.screen.height - windowConfig.height) / 2

    const featuresMap = new Map([
      ['toolbar', 'no'],
      ['location', 'no'],
      ['directories', 'no'],
      ['status', 'no'],
      ['menubar', 'no'],
      ['scrollbars', 'no'],
      ['resizable', 'no'],
      ['copyhistory', 'no'],
      ['width', String(windowConfig.width)],
      ['height', String(windowConfig.height)],
      ['top', String(top)],
      ['left', String(left)],
    ])

    return Array.from(featuresMap.entries())
      .map(([key, value]) => `${key}=${value}`)
      .reduce((acc, feat) => (acc ? `${acc},${feat}` : feat))
  }

  private handshakeCallback(provider: NetlifyOAuthProvider, cb: AuthCallback) {
    const fn = (e: { data: string; origin: string }) => {
      if (e.data === 'authorizing:' + provider && e.origin === this.baseUrl) {
        window.removeEventListener('message', fn, false)
        window.addEventListener('message', this.authorizeCallback(provider, cb), false)
        return this.authWindow?.postMessage(e.data, e.origin)
      }
    }

    return fn
  }

  private authorizeCallback(provider: NetlifyOAuthProvider, cb: AuthCallback) {
    const fn = (e: { origin: string; data: string }) => {
      if (e.origin !== this.baseUrl) {
        return
      }

      if (e.data.indexOf('authorization:' + provider + ':success:') === 0) {
        const successSearchResults = e.data.match(
          new RegExp('^authorization:' + provider + ':success:(.+)$'),
        )
        if (successSearchResults) {
          const data = JSON.parse(successSearchResults[1])
          window.removeEventListener('message', fn, false)
          this.authWindow?.close()
          cb(null, data)
        }
      }

      if (e.data.indexOf('authorization:' + provider + ':error:') === 0) {
        const errorSearchResults = e.data.match(
          new RegExp('^authorization:' + provider + ':error:(.+)$'),
        )
        if (errorSearchResults) {
          const err = JSON.parse(errorSearchResults[1])
          window.removeEventListener('message', fn, false)
          this.authWindow?.close()
          cb(new NetlifyError(err))
        }
      }
    }

    return fn
  }

  protected authenticate = (options: AuthOptions, cb: AuthCallback): void => {
    if (!options.provider) {
      cb(new NetlifyError({ message: NetlifyErrorMsg.noProvider }))
      return
    }

    if (!this.siteId) {
      cb(new NetlifyError({ message: NetlifyErrorMsg.noSiteIdForLocalhost }))
      return
    }

    window.addEventListener('message', this.handshakeCallback(options.provider, cb), false)

    const url = this.getAuthWindowURL(options)
    const authWindowFeatures = this.getAuthWindowFeatures(options.provider)

    this.authWindow = window.open(url, 'Netlify Authorization', authWindowFeatures)
    this.authWindow?.focus()
  }

  getAuthToken = (options: AuthOptions): Promise<string> =>
    new Promise((resolve, reject) =>
      this.authenticate(options, (error, data) => {
        if (error || !data) reject(error)
        else resolve(data.token)
      }),
    )
}
