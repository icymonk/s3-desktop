import { S3Client, type ListObjectsV2CommandInput } from '@aws-sdk/client-s3'
import {
  createBucket,
  deleteObject,
  deleteObjects,
  getListObjects,
  putObject,
} from '~/utils/s3'
import { useAuthStore, type Workspace } from './auth'

export type Bucket = {
  Name: string
  CreationDate: string
}

export const useS3Store = defineStore(
  's3',
  () => {
    const auth$ = useAuthStore()
    const localePath = useLocalePath()

    const loading = ref(false)

    const s3Client = ref<S3Client>()

    const buckets = ref<Bucket[]>([])

    const currentBucket = computed(() => getBucket())

    watch(() => auth$.currentWorkspace, initWorkspace, { flush: 'sync' })

    async function initWorkspace(workspace?: Workspace) {
      if (!workspace) {
        s3Client.value = undefined
        buckets.value = []

        return
      }

      loading.value = true

      s3Client.value = getS3Client(workspace.s3Config)
      fetchBuckets()

      if (useRoute().path === '/') navigateTo(localePath('/b'))
      loading.value = false
    }

    async function fetchBuckets() {
      console.log('fetchBuckets')
      if (!s3Client.value) {
        buckets.value = []
        return
      }

      buckets.value = (await getBuckets(s3Client.value)) as any[]
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

    async function addBucket(name: string) {
      if (!s3Client.value) return false

      console.log('addBucket', name)
      return createBucket(s3Client.value, {
        Bucket: name,
      })
    }

    async function delBucket(name: string) {
      if (!s3Client.value) return []
      console.log('deleteBucket', name)

      await deleteObjects(s3Client.value, {
        Bucket: name,
        Prefix: '',
      })

      return deleteBucket(s3Client.value, { Bucket: name })
    }

    function getBucket() {
      console.log('getBucket')
      return useRoute().path.split('/b/')[1]?.split('/')[0]
    }

    async function getFiles(prefix: string, bucket = getBucket()) {
      if (!s3Client.value) return []

      return getListObjects(s3Client.value, {
        Prefix: prefix,
        Bucket: bucket,
        Delimiter: '/',
      })
    }

    async function uploadFiles(files: File[], prefix = '') {
      if (!s3Client.value) return
      if (!currentBucket.value) return
      console.log('uploadFiles', files)

      const uploadFiles = files.map(async (item) =>
        putObject(s3Client.value!, {
          Body: await item.text(),
          Key: [prefix, item.name].filter(Boolean).join('/'),
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
      if (!s3Client.value) return
      if (!currentBucket.value) return

      return deleteObject(s3Client.value, {
        Bucket: currentBucket.value,
        Key: key,
      })
    }

    async function addFolder(key: string) {
      if (!s3Client.value) return
      if (!currentBucket.value) return

      return putObject(s3Client.value, {
        Bucket: currentBucket.value,
        Key: key + '/',
      })
    }

    async function deleteFolder(key?: string) {
      if (!s3Client.value) return
      if (!currentBucket.value) return

      return deleteObjects(s3Client.value, {
        Bucket: currentBucket.value,
        Prefix: key,
      })
    }

    return {
      loading,
      buckets,
      s3Client,
      fetchBuckets,
      addBucket,
      delBucket,
      addFolder,
      getFiles,
      getBuckets,
      currentBucket,
      initWorkspace,
      uploadFiles,
      downloadFile,
      deleteFile,
      deleteFolder,
    }
  },
  {
    persist: true,
  },
)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useS3Store, import.meta.hot))
}
