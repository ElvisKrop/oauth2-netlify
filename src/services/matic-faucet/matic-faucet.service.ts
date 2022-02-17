import { HttpService } from '../http.service'
import { MaticFaucetResponse } from './types'
import { ErrorMessage, MATIC_REQUEST_SUCCESS_MSG } from './constants'

export class MaticFaucetService extends HttpService {
  private static baseUrl = 'https://api.faucet.matic.network'

  constructor() {
    super(MaticFaucetService.baseUrl, {
      'Content-Type': 'application/json',
    })
  }

  requestMaticFor = async (address: string) => {
    const resp = await this.post<MaticFaucetResponse>('/transferTokens', {
      body: JSON.stringify({
        address: address,
        network: 'mumbai',
        token: 'maticToken',
      }),
    })

    return { ...resp, address }
  }

  requestMaticBatch = async (addresses: string[]): Promise<MaticFaucetResponse[]> => {
    const promises = addresses.map((address) => this.requestMaticFor(address))
    return Promise.all(promises)
  }

  static isResponseOK = (response: MaticFaucetResponse) =>
    !!response?.hash && response.hash === MATIC_REQUEST_SUCCESS_MSG

  static isBalanceTooGreat = (response: MaticFaucetResponse) =>
    !!response?.error && response.error === ErrorMessage.balanceIsToGreat
}
