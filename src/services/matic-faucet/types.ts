import { ErrorMessage } from './constants'

export interface MaticFaucetResponse {
  address: string
  hash?: string
  duration?: number
  error?: ErrorMessage
}
