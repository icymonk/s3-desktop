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
    const workspaces = useElectronStorage<Workspace[]>('workspaces', [])

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

    function addWorkspace(workspace: Workspace) {
      workspaces.value.push(workspace)
    }

    function delWorkspace(index: number) {
      workspaces.value.splice(index, 1)
    }

    return {
      workspaces,
      currentKey,
      currentWorkspace,
      currentSecretKey,
      currentAccessKey,
      addWorkspace,
      delWorkspace,
    }
  },
  {
    persist: true,
  },
)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}
