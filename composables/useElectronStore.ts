import Store from 'electron-store'
import { cloneDeep } from 'lodash'

export function useElectronStorage<T = any>(storeKey: string, defaultValue: T) {
  const store = new Store()

  const state = ref((store.get(storeKey) as T) || cloneDeep(defaultValue))

  watch(
    state,
    (state: any) => {
      store.set(storeKey, state)
    },
    { flush: 'sync' },
  )

  return state
}
