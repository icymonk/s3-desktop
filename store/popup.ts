export const usePopupStore = defineStore('popup', () => {
  return {}
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePopupStore, import.meta.hot))
}
