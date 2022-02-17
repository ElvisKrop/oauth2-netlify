export const MATIC_REQUEST_SUCCESS_MSG = 'TRANSACTION_SENT_TO_DB'

export const DEFAULT_REQUEST_TIMEOUT = 62500

export const MAX_REQUEST_NUMBER = 9

export enum ErrorMessage {
  greyListed = 'you are greylisted',
  balanceIsToGreat = "Matic Tokens are ideally used to pay for gas, the address you're requesting from has enough to pay for gas. If you require in bulk please contact us on Discord.",
}
