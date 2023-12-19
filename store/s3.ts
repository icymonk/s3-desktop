import { S3Client, type ListObjectsV2CommandInput } from '@aws-sdk/client-s3'
import { deleteObject, getListObjects, putObject } from '~/utils/s3'
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

    watch(() => auth$.currentWorkspace, initWorkspace, { flush: 'sync' })

    async function initWorkspace(workspace?: Workspace) {
      if (!workspace) {
        s3Client.value = undefined
        buckets.value = []

        return
      }

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

    async function getFiles(prefix: string) {
      if (!s3Client.value) return []

      return getListObjects(s3Client.value, {
        Prefix: prefix,
        Bucket: useRoute().path.split('/')[2],
        Delimiter: '/',
      })
    }

    async function uploadFiles(files: File[], prefix = '') {
      if (!s3Client.value) return false
      if (!currentBucket.value) return
      console.log('uploadFiles', files)

      const uploadFiles = files.map(async (item) =>
        putObject(s3Client.value!, {
          Body: await item.text(),
          Key: `${prefix}/${item.name}`,
          Bucket: currentBucket.value!,
        }),
      )

      return Promise.all(uploadFiles)
    }

    async function downloadFile(key: string) {
      if (!s3Client.value) return
      if (!currentBucket.value) return

      getObject(s3Client.value, { Bucket: currentBucket.value, Key: key })
    }

    async function deleteFile(key: string) {
      if (!s3Client.value) return false
      if (!currentBucket.value) return

      return deleteObject(s3Client.value, {
        Bucket: currentBucket.value,
        Key: key,
      })
    }

    return {
      loading,
      buckets,
      s3Client,
      getFiles,
      getBuckets,
      currentBucket,
      initWorkspace,
      uploadFiles,
      downloadFile,
      deleteFile,
    }
  },
  {
    persist: true,
  },
)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useS3Store, import.meta.hot))
}
