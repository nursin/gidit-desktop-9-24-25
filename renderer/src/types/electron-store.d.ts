declare module 'electron-store' {
  export interface Options<T>
    extends Partial<{
      defaults: T
    }> {}

  export default class Store<T extends Record<string, unknown> = Record<string, unknown>> {
    constructor(options?: Options<T>)
    public get<K extends keyof T>(key: K): T[K]
    public set<K extends keyof T>(key: K, value: T[K]): void
  }
}
