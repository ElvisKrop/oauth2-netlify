export abstract class HttpService {
  protected constructor(private baseURL: string) {
  }

  private request = async (endpoint: string, options: RequestInit) => {
    const response = await fetch(`${this.baseURL}${endpoint}`, options)

    let json

    try {
      json = await response.clone().json()
    } catch {
      json = response.text()
    }

    if (response.ok) {
      return json
    }
    throw new Error(response.statusText)
  }

  protected get = async (endpoint: string, options: RequestInit) => this.request(endpoint, { ...options, method: 'GET' })

  protected post = async (endpoint: string, options: RequestInit) => this.request(endpoint, { ...options, method: 'POST' })

  protected patch = async (endpoint: string, options: RequestInit) => this.request(endpoint, { ...options, method: 'PATCH' })

  protected delete = async (endpoint: string, options: RequestInit) => this.request(endpoint, { ...options, method: 'DELETE' })
}
