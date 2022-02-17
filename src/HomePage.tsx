import React, { CSSProperties, useCallback, useEffect, useMemo, useState } from 'react'
import {
  DEFAULT_REQUEST_TIMEOUT,
  MaticFaucetResponse,
  MaticFaucetService,
  MAX_REQUEST_NUMBER,
} from './services/matic-faucet'

type Timer = ReturnType<typeof setInterval>

const styles: Record<string, CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
  },
  form: { maxWidth: '386px', textAlign: 'center' },
  textarea: { height: '200px', width: '360px', margin: '10px' },
  limitationWarning: { color: 'grey' },
}

const updateAddresses = (responses: MaticFaucetResponse[], buffer: string[]) => {
  console.table(responses)

  if (!responses.every(MaticFaucetService.isResponseOK)) {
    const addresses = responses
      .filter((resp) => !MaticFaucetService.isBalanceTooGreat(resp))
      .map(({ address }) => address)

    let numberFromBuffer = 0
    if (addresses.length < MAX_REQUEST_NUMBER) {
      numberFromBuffer = MAX_REQUEST_NUMBER - addresses.length
      addresses.push(...buffer.slice(0, numberFromBuffer))
    }

    return {
      addresses,
      buffer: buffer.slice(numberFromBuffer),
    }
  } else {
    return {
      addresses: responses.map(({ address }) => address),
      buffer,
    }
  }
}

const splitStringToArray = (str: string) =>
  str
    .trim()
    .replaceAll(',', '\n')
    .split('\n')
    .filter(Boolean)
    .map((address) => address.trim())

const HomePage = () => {
  const maticFaucetService = useMemo(() => new MaticFaucetService(), [])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const [timestamp, setTimestamp] = useState(0)
  const timeLeft = useMemo(
    () => Math.floor(DEFAULT_REQUEST_TIMEOUT / 1000) - timestamp,
    [timestamp],
  )

  const [requestCount, setRequestCount] = useState(0)
  const increaseRequestCount = () => setRequestCount((prev) => prev + 1)

  const [textAreaValue, setTextAreaValue] = useState<string>('')
  const addresses = useMemo(() => splitStringToArray(textAreaValue), [textAreaValue])

  useEffect(() => {
    let interval: Timer | null = null
    if (loading) {
      interval = setInterval(() => setTimestamp((prev) => prev + 1), 1000)
    }

    if (interval && !loading) {
      clearInterval(interval)
    }
    return () => (interval ? clearInterval(interval) : undefined)
  }, [loading])

  const onClickHandler = useCallback(async () => {
    let interval: Timer | null = null
    increaseRequestCount()
    setSuccess(false)

    try {
      let _addresses = addresses.slice(0, MAX_REQUEST_NUMBER)
      let addrBuffer = addresses.slice(MAX_REQUEST_NUMBER)

      setLoading(true)
      const serviceResponse = await maticFaucetService.requestMaticBatch(_addresses)

      const update = updateAddresses(serviceResponse, addrBuffer)
      _addresses = update.addresses
      addrBuffer = update.buffer

      interval = setInterval(async () => {
        const _serviceResponse = await maticFaucetService.requestMaticBatch(_addresses)
        increaseRequestCount()
        setTimestamp(0)

        const _update = updateAddresses(_serviceResponse, addrBuffer)
        _addresses = _update.addresses
        addrBuffer = _update.buffer

        if (_addresses.length === 0 && interval) {
          setLoading(false)
          setTimestamp(0)
          setRequestCount(0)
          setSuccess(true)
          clearInterval(interval)
        }
      }, DEFAULT_REQUEST_TIMEOUT)
    } catch (e) {
      setLoading(false)
      setTimestamp(0)
      setRequestCount(0)
      if (interval) clearInterval(interval)
      console.error(e)
    }
  }, [addresses, maticFaucetService])

  return (
    <div style={styles.container}>
      <div style={styles.form}>
        <h1>Matic Faucet</h1>
        <span>
          Matic will be requested for each address from your list which balance is less than 10
          Matic
        </span>
        <textarea
          disabled={loading}
          placeholder={`0x0000000000000000000000000000000000000000\n0x0000000000000000000000000000000000000000\n...`}
          value={textAreaValue}
          onChange={(e) => setTextAreaValue(e.target.value)}
          style={styles.textarea}
        />
        {addresses.length > MAX_REQUEST_NUMBER && (
          <div style={styles.limitationWarning}>
            Your list of addresses will be split in several groups
          </div>
        )}
        <button disabled={addresses.length === 0 || loading} onClick={onClickHandler}>
          Click me to start
        </button>
        {loading && (
          <div>
            <div>
              Matic was requested <b>{requestCount}</b> times
            </div>
            <div>Next request will happen in {timeLeft}</div>
          </div>
        )}
        {success && <h2>Done! Each address from the list has balance greater than 10 Matic</h2>}
      </div>
    </div>
  )
}

export default HomePage
