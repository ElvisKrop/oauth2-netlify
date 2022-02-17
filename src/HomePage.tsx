import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ErrorMessage,
  MATIC_REQUEST_SUCCESS_MSG,
  MyCustomCallService,
  RequestMaticResponse,
} from './services/my-custom-call.service'

// const myAddrs = [
//   '0xcEd10D7f66078F6e298ED0E60a630F7B89a2b9b1',
//   '0x2930415a5957bcC9a56f2d236960f68C971e9656',
//   '0xAb0d576A122f91421108cD99b2bcb12E9DA95D4A',
//   '0x17D3f8E3F48f4D9b033BaF6CB9F1Ddc4E5B5552f',
//   '0x5560CD94eDC21519e12997b808B2F27F3d859D8D',
//   '0x011ac15A6a9AA553d62054Ff8f488E007622e364',
//   '0x36B5C8f75Bd0C41dB6cdc33C0a04F388706FF4d7',
//   '0x9e8120142E6486259168c6D6B9B548d3eBe28E9b',
//   '0xd1D16f5A7b328c812eBd056D22cA32952f0DA402',
//   '0xBc7b27d457Aa041EA2482420c01445b4C840b8A3',
//   '0xB9b7c6792d428e25703eAb7D84ce72a6cd3A840D',
//   '0x5C05090BDa0A23d8222532D22ff69eFBfBBb5eB9',
//   '0x4e10Ce11831d03D748058eb7d5e275E2c4f4FCab',
//   '0xAbC9069B71B203741AF4dd1002B83Bd7D52ca3A1',
//   '0xA8183C06C52Cacc72bBd3E261768F9eA14BF4BAA',
// ]

// const anton = [
//   '0xE99866C3e5533F0c42c341A9A926feC0CF6f626A',
//   '0xfe0b250F470d7D2B77B6C6241133929c52f18533',
//   '0x6F35C654512C44EBbd6fe75012B6fb0e0C993FfB',
//   '0x42eE93Fe5949d0f3Eb0EC5fa5837A99e7Ef7c0aB',
//   '0x259C8385e63B7eC1BA5e0Bedc71e43039fd18C6C',
//   '0x48121d13e7117b8bC1A4f4960fCcb981C8aa42ac',
// ]

const GENERAL_TIMEOUT = 62500

// const addresses = [...anton]

const isResponseOK = (response: RequestMaticResponse) =>
  !!response?.hash && response.hash === MATIC_REQUEST_SUCCESS_MSG

const HomePage = () => {
  const myCustomCallService = useMemo(() => new MyCustomCallService(), [])
  // const [textAreaValue, setTextAreaValue] = useState<string>(myAddrs.join('\n'))
  const [textAreaValue, setTextAreaValue] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [timestamp, setTimestamp] = useState(0)

  const [requestCount, setRequestCount] = useState(0)
  const increaseRequestCount = () => setRequestCount((prev) => prev + 1)

  const addresses = useMemo(
    () =>
      textAreaValue
        .trim()
        .replaceAll(',', '\n')
        .split('\n')
        .filter(Boolean)
        .map((address) => address.trim()),
    [textAreaValue],
  )
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null
    if (loading) {
      interval = setInterval(() => setTimestamp((prev) => prev + 1), 1000)
    }

    if (interval && !loading) {
      clearInterval(interval)
    }
    return () => (interval ? clearInterval(interval) : undefined)
  }, [loading])

  const onClickHandler = useCallback(async () => {
    let interval: ReturnType<typeof setInterval> | null = null
    increaseRequestCount()

    try {
      let _addresses = addresses.slice(0, 9)
      let addrBuffer = addresses.filter((value) => !_addresses.some((addr) => addr === value))

      const promises = _addresses.map((address) => myCustomCallService.requestMaticFor(address))
      const resps = await Promise.all(promises)

      setLoading(true)

      console.log('1st time request')
      console.table(resps)

      if (!resps.every(isResponseOK)) {
        _addresses = resps.reduce((acc, value, index) => {
          if (_addresses[index] && value.error !== ErrorMessage.balanceIsToGreat)
            acc.push(_addresses[index])
          return acc
        }, [] as string[])

        if (_addresses.length < 9) {
          const addrsToConcat = addrBuffer.slice(0, 9 - _addresses.length)
          _addresses.push(...addrsToConcat)
          addrBuffer = addrBuffer.filter((value) => !addrsToConcat.some((addr) => addr === value))
        }
      }

      interval = setInterval(async () => {
        const _promise = await _addresses.map((address) =>
          myCustomCallService.requestMaticFor(address),
        )
        const _resp = await Promise.all(_promise)
        increaseRequestCount()
        setTimestamp(0)
        console.table(_resp)

        if (!_resp.every(isResponseOK)) {
          _addresses = _resp.reduce((acc, value, index) => {
            if (_addresses[index] && value.error !== ErrorMessage.balanceIsToGreat)
              acc.push(_addresses[index])
            return acc
          }, [] as string[])

          if (_addresses.length < 9) {
            const addrsToConcat = addrBuffer.slice(0, 9 - _addresses.length)
            _addresses.push(...addrsToConcat)
            addrBuffer = addrBuffer.filter((value) => !addrsToConcat.some((addr) => addr === value))
          }
        }

        if ((requestCount > 100 || _addresses.length === 0) && interval) {
          setLoading(false)
          console.log('DONE!!!!!')
          clearInterval(interval)
        }
      }, GENERAL_TIMEOUT)
    } catch (e) {
      setLoading(false)
      if (interval) clearInterval(interval)
      console.error(e)
    }
  }, [addresses, myCustomCallService, requestCount])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}
    >
      <div style={{ maxWidth: '386px', textAlign: 'center' }}>
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
          style={{ height: '200px', width: '360px', margin: '10px' }}
        />
        {addresses.length > 9 && (
          <i style={{ display: 'block', color: 'grey' }}>
            Your list of addresses will be split in several groups
          </i>
        )}
        <button disabled={addresses.length === 0 || loading} onClick={onClickHandler}>
          Click me to start
        </button>
      </div>
      {loading && (
        <div>
          <div>
            Matic was requested <b>{requestCount}</b> times
          </div>
          <div>Next request will happen in {62 - timestamp}</div>
        </div>
      )}
    </div>
  )
}

export default HomePage
