export abstract class LocalStorageService<TValue> {
  protected constructor(
    private readonly key: string,
    private validate: (value: TValue) => boolean = (value) => !!value,
    private encode: (value: Partial<TValue>) => string = JSON.stringify,
    private decode: (str: string) => TValue | null = JSON.parse,
  ) {}

  protected getItem = () => {
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

  protected setItem = (value: Partial<TValue>) => {
    if (typeof value === 'string') {
      localStorage.setItem(this.key, value)
    } else {
      localStorage.setItem(this.key, this.encode(value))
    }
  }

  protected removeItem = () => localStorage.removeItem(this.key)
}
