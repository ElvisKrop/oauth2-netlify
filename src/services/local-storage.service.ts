export abstract class LocalStorageService<TValue> {
  protected constructor(
    private readonly key: string,
    private validate: (value: TValue) => boolean = (value) => !!value,
    private encode: (value: Partial<TValue>) => string = JSON.stringify,
    private decode: (str: string) => TValue | null = JSON.parse,
  ) {}


  protected checkStored = () => {
    const length = localStorage.length
    const keyExists = Array(length).some((_, index) => localStorage.key(index) === this.key)
    const value = this.getItem()
    return keyExists && value && this.validate(value)
  }

  getItem = () => {
    const length = localStorage.length
    const keyExists = Array(length).some((_, index) => localStorage.key(index) === this.key)
    if (!keyExists) throw new Error('No such key in the storage')

    const value = localStorage.getItem(this.key)
    if (!value) throw new Error('No value in the local storage')

    const decodedValue = this.decode(value)
    if (!decodedValue) throw new Error('Set any value at first')

    if (!this.validate(decodedValue)) {
      this.removeItem()
      throw new Error('The value was outdated! Authorize once again.')
    }

    return decodedValue
  }

  setItem = (value: Partial<TValue>) => {
    if (typeof value === 'string') {
      localStorage.setItem(this.key, value)
    } else {
      localStorage.setItem(this.key, this.encode(value))
    }
  }

  protected removeItem = () => localStorage.removeItem(this.key)
}