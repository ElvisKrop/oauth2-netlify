import { HttpService } from './http.service'

export const MATIC_REQUEST_SUCCESS_MSG = 'TRANSACTION_SENT_TO_DB'

export enum ErrorMessage {
  greyListed = 'you are greylisted',
  balanceIsToGreat = "Matic Tokens are ideally used to pay for gas, the address you're requesting from has enough to pay for gas. If you require in bulk please contact us on Discord.",
}

export interface RequestMaticResponse {
  hash?: string
  duration?: number
  error?: ErrorMessage
}

export class MyCustomCallService extends HttpService {
  private static baseUrl = 'https://api.faucet.matic.network'

  constructor() {
    super(MyCustomCallService.baseUrl, {
      'Content-Type': 'application/json',
    })
  }

  requestMaticFor = async (address: string): Promise<RequestMaticResponse> =>
    this.post('/transferTokens', {
      body: JSON.stringify({
        address: address,
        network: 'mumbai',
        token: 'maticToken',
      }),
    })
}
