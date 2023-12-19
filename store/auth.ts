import Store from 'electron-store'

export type Workspace = {
  name: string
  icon: string
  s3Config: any
  // s3Config: S3ClientConfig & {
  //   credentials?: { accessKeyId?: string; secretAccessKey?: string }
  // }
}

export const useAuthStore = defineStore(
  'auth',
  () => {
    const store = new Store()
    const workspaces = ref<Workspace[]>([])

    const currentKey = ref('')

    const currentWorkspace = computed(() =>
      workspaces.value.find((item) => item.name === currentKey.value),
    )

    const currentAccessKey = computed(
      () => currentWorkspace.value?.s3Config.credentials?.accessKeyId,
    )
    const currentSecretKey = computed(
      () => currentWorkspace.value?.s3Config.credentials?.secretAccessKey,
    )

    function loadWorkspace() {
      workspaces.value = (store.get('workspaces') as Workspace[]) || []
    }
    function saveWorkspace(items = workspaces.value || []) {
      workspaces.value = items
      store.set('workspaces', items)
    }

    function addWorkspace(workspace: Workspace) {
      workspaces.value.push(workspace)
      saveWorkspace()
    }

    function delWorkspace(index: number) {
      workspaces.value.splice(index, 1)
      saveWorkspace()
    }

    return {
      workspaces,
      currentKey,
      currentWorkspace,
      currentSecretKey,
      currentAccessKey,
      addWorkspace,
      delWorkspace,
      loadWorkspace,
      saveWorkspace,
    }
  },
  {
    persist: true,
  },
)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}
