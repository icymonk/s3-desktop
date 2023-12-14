import { S3Client, type ListObjectsV2CommandInput } from '@aws-sdk/client-s3'
import { getListObjects } from '~/utils/s3'
import { useAuthStore, type Workspace } from './auth'

export type Bucket = {
  Name: string
  CreationDate: string
}

export const useS3Store = defineStore(
  's3',
  () => {
    const auth$ = useAuthStore()

    const loading = ref(false)

    const s3Client = ref<S3Client>()

    const buckets = ref<Bucket[]>([])

    const currentBucket = computed(() =>
      useRoute().path.startsWith('/b') ? useRoute().path.split('/')[2] : null,
    )

    watch(() => auth$.currentWorkspace, initWorkspace)

    async function initWorkspace(workspace?: Workspace) {
      if (!workspace) return

      loading.value = true

      s3Client.value = getS3Client(workspace.s3Config)
      buckets.value = (await getBuckets(s3Client.value)) as any[]

      if (useRoute().path === '/') navigateTo('/b')
      loading.value = false
    }

    // async function getBuckets(workspace?: Workspace): Promise<Bucket[]> {
    //   if (!workspace?.s3Config.credentials) return []

    //   return $fetch('/api/getBuckets', {
    //     method: 'POST',
    //     body: {
    //       apiVersion: workspace.s3Config.apiVersion,
    //       region: workspace.s3Config.region,
    //       accessKeyId: workspace.s3Config.credentials.accessKeyId,
    //       secretAccessKey: workspace.s3Config.credentials.secretAccessKey,
    //     },
    //   })
    // }

    async function getObjects(input: Partial<ListObjectsV2CommandInput> = {}) {
      if (!s3Client.value) return []

      return getListObjects(s3Client.value, {
        ...input,
        Bucket: useRoute().path.split('/')[2],
        Delimiter: '/',
      })
    }

    async function downloadFile(key: string) {
      if (!s3Client.value) return
      if (!currentBucket.value) return

      getObject(s3Client.value, { Bucket: currentBucket.value, Key: key })
    }

    return {
      loading,
      buckets,
      s3Client,
      getObjects,
      getBuckets,
      currentBucket,
      initWorkspace,
      downloadFile,
    }
  },
  {
    persist: true,
  },
)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useS3Store, import.meta.hot))
}
