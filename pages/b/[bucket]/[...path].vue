<template>
  <div ref="wrapperRef" class="wrapper">
    <div v-if="isOverDropZone" class="dropzone">
      <div>{{ $t('dropzone.message') }}</div>
    </div>

    <NSpace justify="space-between" align="center" class="table-header">
      <NSpace>
        <NInput
          v-model:value="searchInput"
          :placeholder="$t('search')"
        ></NInput>
      </NSpace>

      <NSpace>
        <NButton @click="onClickRefresh">
          <template #icon>
            <NIcon>
              <Refresh></Refresh>
            </NIcon>
          </template>
        </NButton>

        <NButton
          :disabled="checkedRowKeys.length !== 1"
          @click="onClickDownload"
        >
          <template #icon>
            <NIcon>
              <DownloadOutline></DownloadOutline>
            </NIcon>
          </template>

          {{ $t('download') }}
        </NButton>

        <NButton @click="onClickCreateFolder">
          {{ $t('createFolder.button') }}
        </NButton>

        <NButton :disabled="!checkedRowKeys.length" @click="onClickDelete">
          {{ $t('delete') }}
        </NButton>
      </NSpace>
    </NSpace>

    <NDataTable
      :loading="loading"
      :columns="columns"
      :data="filteredFiles"
      :row-key="(row) => row.Key"
      @update:checked-row-keys="onChangeCheckedRow"
    ></NDataTable>
  </div>
</template>

<script lang="ts" setup>
import {
  NDataTable,
  NButton,
  NIcon,
  NInput,
  NSpace,
  useDialog,
  useMessage,
} from 'naive-ui'
import bytes from 'bytes'
import { useS3Store } from '~/store/s3'
import { Refresh, DownloadOutline } from '@vicons/ionicons5'
import { useDropZone } from '@vueuse/core'

const route = useRoute()

const s3$ = useS3Store()

const dialog = useDialog()
const message = useMessage()
const localePath = useLocalePath()
const { t, d } = useI18n()

const wrapperRef = ref()
const { isOverDropZone } = useDropZone(wrapperRef, {
  onDrop,
})

function onDrop(files: File[] | null, event: DragEvent) {
  if (!files) return
  console.log('onDrop', files, event)

  dialog.success({
    negativeText: t('cancel'),
    positiveText: t('upload'),
    content() {
      const fileListEl = files.map((item) => h('li', null, `"${item.name}"`))
      const ul = h('ul', null, fileListEl)
      const descEl = h('span', null, t('uploadFile.contentMessage'))

      return h('div', null, [ul, descEl])
    },
    async onPositiveClick() {
      try {
        await s3$.uploadFiles(files, prefix.value)
        fetchFiles()
        message.success(t('uploadFile.successMessage'))
      } catch (error: any) {
        message.error(`${error.name}: ${error.message}`)
      }
    },
  })
}

const loading = ref(false)

const columns = computed<any[]>(() => [
  {
    type: 'selection',
  },
  {
    title: t('name'),
    key: 'Name',
    sorter: 'default',
    resizable: true,
    render(row: any) {
      return row.isDirectory
        ? h(
            NButton,
            { type: 'info', text: true, onClick: () => onClickDirectory(row) },
            { default: () => row.Name },
          )
        : row.Name
    },
  },
  {
    title: t('lastModified'),
    key: 'LastModified',
    sorter: 'default',
    resizable: true,
    align: 'right',
    render(row: any) {
      return row.LastModified ? d(row.LastModified, 'long') : '-'
    },
  },
  {
    title: t('size'),
    key: 'Size',
    sorter: 'default',
    resizable: true,
    align: 'right',
    render(row: any) {
      return bytes(row.Size) || '-'
    },
  },
])
const files = ref<any[]>([])

const prefix = computed(() =>
  Array.isArray(route.params.path)
    ? route.params.path.join('/')
    : route.params.path,
)

const searchInput = ref('')

const filteredFiles = computed(() => {
  const filtered = [
    ...files.value
      .filter(
        (item) => !searchInput.value || item.Name.includes(searchInput.value),
      )
      .filter((item) => item.Key !== `${prefix.value}/`),
  ]

  if (prefix.value) {
    filtered.unshift({
      Name: '..',
      Key: '..',
      isDirectory: true,
      isNavigation: true,
    })
  }

  return filtered
})

const checkedRowKeys = ref<string[]>([])

function onChangeCheckedRow(rowKeys: any[]) {
  console.log('onChangeCheckedRow', rowKeys)
  checkedRowKeys.value = rowKeys
}

function getFileByKey(key: string) {
  console.log('getFileByKey')

  return files.value.find((item) => item.Key == key)
}

const folderInput = ref('')

function onClickCreateFolder() {
  console.log('onClickCreateFolder')

  folderInput.value = ''

  const _dialog = dialog.success({
    title: t('createFolder.title'),
    negativeText: t('cancel'),
    positiveText: t('create'),
    content() {
      const input = h(NInput, {
        value: folderInput.value,
        placeholder: t('createFolder.namePlaceholder'),
        passivelyActivated: true,
        onUpdateValue(value) {
          folderInput.value = value
        },
        async onKeyup(e) {
          console.log('onKeyup', e)
          if (e.key !== 'Enter') return

          await addFolder()
          _dialog.destroy()
        },
        async onVnodeMounted() {
          await nextTick()
          input.el?.querySelector('input')?.focus()
        },
      })
      return h('div', null, input)
    },
    onPositiveClick: addFolder,
  })
}

async function addFolder() {
  try {
    await s3$.addFolder(`${prefix.value}/${folderInput.value}`)
    fetchFiles()
    message.success(t('createFolder.successMessage'))
  } catch (error: any) {
    message.error(`${error.name}: ${error.message}`)
  }
}

function onClickRefresh() {
  console.log('onClickRefresh')
  fetchFiles()
}

function onClickDelete() {
  console.log('onClickDelete')

  const files = checkedRowKeys.value.map(getFileByKey).filter(Boolean)
  console.log('files', files)

  const filenames = files.map((item) => `"${item.Name}"`)

  dialog.error({
    negativeText: t('cancel'),
    positiveText: t('delete'),
    content() {
      const fileListEl = filenames.map((item) => h('li', null, item))
      const ul = h('ul', null, fileListEl)
      const descEl = h('span', null, t('deleteFile.contentMessage'))

      return h('div', null, [ul, descEl])
    },
    async onPositiveClick() {
      try {
        const deleteFiles = files.map((item) =>
          item.isDirectory ? deleteFolder(item.Key) : deleteFile(item.Key),
        )
        await Promise.all(deleteFiles)

        message.success(t('deleteFile.successMessage'))
      } catch (error: any) {
        message.error(`${error.name}: ${error.message}`)
      }
    },
  })
}

async function deleteFile(key: string) {
  await s3$.deleteFile(key)
  const index = files.value.findIndex((item) => item.Key === key)
  files.value.splice(index, 1)
}

async function deleteFolder(key: string) {
  await s3$.deleteFolder(key)
  const index = files.value.findIndex((item) => item.Key === key)
  files.value.splice(index, 1)
}

function onClickDownload() {
  console.log('onClickDownload')
  if (checkedRowKeys.value.length !== 1) return

  s3$.downloadFile(checkedRowKeys.value[0])
}

function onClickDirectory(file: any) {
  if (file.Key === '..') {
    const _path = route.path.split('/')
    const path = _path.slice(0, route.path.split('/').length - 1).join('/')

    navigateTo(localePath(path))

    return
  }

  navigateTo(localePath(`${route.path}/${file.Name.replace('/', '')}`))
}

async function fetchFiles() {
  try {
    loading.value = true
    const _files =
      (await s3$.getFiles(prefix.value && `${prefix.value}/`)) || []

    files.value = _files.map((item) => ({
      ...item,
      Name: prefix.value ? item.Key?.replace(`${prefix.value}/`, '') : item.Key,
    }))
  } catch (error: any) {
    message.error(error.toString())
  } finally {
    loading.value = false
  }
}

fetchFiles()
</script>

<style lang="scss" scoped>
.wrapper {
  position: relative;
  min-height: calc(100vh - 58px);

  padding: 0 16px;
}

.table-header {
  padding: 8px 0;
}

.dropzone {
  display: flex;
  justify-content: center;
  align-items: center;

  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  background-color: #aaaaaa66;
  z-index: 10;

  font-size: 40px;
  color: #999;
}
</style>
