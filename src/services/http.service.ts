export abstract class HttpService {
  protected constructor(private baseURL: string, private defaultHeaders: HeadersInit = {}) {
  }

  private request = async <TResponse>(endpoint: string, { headers = {}, ...restOptions }: RequestInit): Promise<TResponse> => {
    const response = await fetch(
      `${this.baseURL}${endpoint}`,
      {
        headers: {
          ...this.defaultHeaders,
          ...headers,
        },
        ...restOptions,
      })

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

  protected get = async <TResponse>(endpoint: string, options: RequestInit) => this.request<TResponse>(endpoint, { ...options, method: 'GET' })

  protected post = async <TResponse>(endpoint: string, options: RequestInit) => this.request<TResponse>(endpoint, { ...options, method: 'POST' })

  protected patch = async <TResponse>(endpoint: string, options: RequestInit) => this.request<TResponse>(endpoint, { ...options, method: 'PATCH' })

  protected delete = async <TResponse>(endpoint: string, options: RequestInit) => this.request<TResponse>(endpoint, { ...options, method: 'DELETE' })
}
