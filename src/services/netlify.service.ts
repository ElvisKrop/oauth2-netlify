/* eslint-disable @typescript-eslint/no-explicit-any */
import { NetlifyOAuthProvider } from '../enums'
import { NetlifyOAuthResponse } from '../types'

interface WindowParams {
  width: number
  height: number
}

const NETLIFY_API = 'https://api.netlify.com'

class NetlifyError {
  constructor(public err: { message: string }) {}

  toString = () => this.err && this.err.message
}

const PROVIDERS: Record<NetlifyOAuthProvider, WindowParams> = {
  github: {
    width: 960,
    height: 600,
  },
  gitlab: {
    width: 960,
    height: 600,
  },
  bitbucket: {
    width: 960,
    height: 500,
  },
  // email: {
  //   width: 500,
  //   height: 400,
  // },
}

class Netlify {
  private authWindow?: WindowProxy | null

  readonly #siteId?: string

  constructor(siteId?: string, private readonly baseUrl: string = NETLIFY_API) {
    this.#siteId = siteId
  }

  get siteId() {
    if (this.#siteId) {
      return this.#siteId
    }

    const host = document.location.host.split(':')[0]
    return host === 'localhost' ? null : host
  }

  handshakeCallback(
    options: { provider: NetlifyOAuthProvider },
    cb: (error: NetlifyError | null, data?: NetlifyOAuthResponse) => void,
  ) {
    const fn = (e: { data: string; origin: string }) => {
      if (e.data === 'authorizing:' + options.provider && e.origin === this.baseUrl) {
        window.removeEventListener('message', fn, false)
        window.addEventListener('message', this.authorizeCallback(options, cb), false)
        return this.authWindow?.postMessage(e.data, e.origin)
      }
    }
    return fn
  }

  authorizeCallback(
    options: { provider: NetlifyOAuthProvider },
    cb: (error: NetlifyError | null, data?: NetlifyOAuthResponse) => void,
  ) {
    const fn = (e: { origin: string; data: any }) => {
      let data, err
      if (e.origin !== this.baseUrl) {
        return
      }
      if (e.data.indexOf('authorization:' + options.provider + ':success:') === 0) {
        data = JSON.parse(
          e.data.match(new RegExp('^authorization:' + options.provider + ':success:(.+)$'))[1],
        )
        window.removeEventListener('message', fn, false)
        this.authWindow?.close()
        cb(null, data)
      }
      if (e.data.indexOf('authorization:' + options.provider + ':error:') === 0) {
        err = JSON.parse(
          e.data.match(new RegExp('^authorization:' + options.provider + ':error:(.+)$'))[1],
        )
        window.removeEventListener('message', fn, false)
        this.authWindow?.close()
        cb(new NetlifyError(err))
      }
    }
    return fn
  }

  authenticate(
    options: {
      provider: NetlifyOAuthProvider
      scope?: any
      login?: any
      beta_invite?: any
      invite_code?: any
    },
    cb: (error: NetlifyError | null, data?: NetlifyOAuthResponse) => void,
  ) {
    let url
    const siteID = this.siteId
    const { provider } = options
    if (!provider) {
      return cb(
        new NetlifyError({
          message: 'You must specify a provider when calling Netlify.authenticate',
        }),
      )
    }
    if (!siteID) {
      return cb(
        new NetlifyError({
          message:
            'You must set a siteId with new Netlify("your-site-id") to make authentication work from localhost',
        }),
      )
    }

    const conf = provider ? PROVIDERS[provider] : PROVIDERS.github
    const left = screen.width / 2 - conf.width / 2
    const top = screen.height / 2 - conf.height / 2
    window.addEventListener('message', this.handshakeCallback(options, cb), false)
    url = this.baseUrl + '/auth?provider=' + options.provider + '&site_id=' + siteID
    if (options.scope) {
      url += '&scope=' + options.scope
    }
    if (options.login === true) {
      url += '&login=true'
    }
    if (options.beta_invite) {
      url += '&beta_invite=' + options.beta_invite
    }
    if (options.invite_code) {
      url += '&invite_code=' + options.invite_code
    }
    this.authWindow = window.open(
      url,
      'Netlify Authorization',
      'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, ' +
        ('width=' +
          conf.width +
          ', height=' +
          conf.height +
          ', top=' +
          top +
          ', left=' +
          left +
          ');'),
    )
    this.authWindow?.focus()
  }
}

export class NetlifyService extends Netlify {
  auth = (provider: NetlifyOAuthProvider, scope?: string): Promise<string> =>
    new Promise((resolve, reject) =>
      this.authenticate({ provider, scope }, (error, data) => {
        if (error || !data) reject(error)
        else resolve(data.token)
      }),
    )
}
