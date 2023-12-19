<template>
  <div ref="wrapperRef" class="wrapper">
    <div v-if="isOverDropZone" class="dropzone">
      <div>파일을 올려놓으세요</div>
    </div>

    <DevOnly>
      <div>prefix: {{ prefix }}</div>
      <div>$route.path: {{ $route.path }}</div>
      <div>$route.params: {{ $route.params }}</div>
    </DevOnly>

    <NDataTable
      :loading="loading"
      :columns="columns"
      :data="filteredFiles"
    ></NDataTable>
  </div>
</template>

<script lang="ts" setup>
import {
  NDataTable,
  NDropdown,
  NButton,
  NIcon,
  useDialog,
  useMessage,
} from 'naive-ui'
import bytes from 'bytes'
import { useS3Store } from '~/store/s3'
import { EllipsisVertical } from '@vicons/ionicons5'
import { useDropZone } from '@vueuse/core'

const route = useRoute()

const s3$ = useS3Store()

const dialog = useDialog()
const message = useMessage()

const wrapperRef = ref()
const { isOverDropZone } = useDropZone(wrapperRef, {
  onDrop,
})

function onDrop(files: File[] | null, event: DragEvent) {
  if (!files) return
  console.log('onDrop', files, event)

  const filenames = files.map((item) => `"${item.name}"`)

  dialog.success({
    negativeText: '취소',
    positiveText: '업로드',
    content() {
      const fileListEl = files.map((item) => h('li', null, `"${item.name}"`))
      const ul = h('ul', null, fileListEl)
      const descEl = h(
        'span',
        null,
        `해당 파일${filenames.length > 1 ? '들' : ''}을 업로드하시겠습니까?`,
      )

      return h('div', null, [ul, descEl])
    },
    async onPositiveClick() {
      try {
        await s3$.uploadFiles(files, prefix.value)
        fetchFiles()
        message.success(`업로드 완료`)
      } catch (error) {
        message.error(`업로드 실패`)
      }
    },
  })
}

const loading = ref(false)

const columns = ref<any[]>([
  {
    title: 'Name',
    key: 'Name',
    sorter: 'default',
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
    title: 'LastModified',
    key: 'LastModified',
    sorter: 'default',
    align: 'right',
    render(row: any) {
      return row.LastModified?.toLocaleString() || '-'
    },
  },
  {
    title: 'Size',
    key: 'Size',
    sorter: 'default',
    align: 'right',
    render(row: any) {
      return bytes(row.Size) || '-'
    },
  },
  {
    title: '',
    key: 'Etc',
    align: 'right',
    render(row: any) {
      return row.isNavigation
        ? ''
        : h(
            NDropdown,
            {
              trigger: 'hover',
              placement: 'bottom-end',
              options: row.isDirectory
                ? [
                    {
                      label: 'Delete',
                      key: 'Delete',
                    },
                  ]
                : [
                    {
                      label: 'Download',
                      key: 'Download',
                    },
                    {
                      label: 'Delete',
                      key: 'Delete',
                    },
                  ],
              onSelect: (value) => onSelectOption(row, value),
            },
            {
              default: () =>
                h(NButton, {
                  text: true,
                  renderIcon: () =>
                    h(NIcon, {}, { default: () => h(EllipsisVertical) }),
                }),
            },
          )
    },
  },
])
const files = ref<any[]>([])

const prefix = computed(() =>
  Array.isArray(route.params.path)
    ? route.params.path.join('/')
    : route.params.path,
)

const filteredFiles = computed(() => {
  const filtered = [
    ...files.value.filter((item) => item.Key !== `${prefix.value}/`),
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

async function onSelectOption(row: any, value: any) {
  console.log('onSelectOption:value', value)

  if (value === 'Download') {
    s3$.downloadFile(row.Key)
  } else if (value === 'Delete') {
    dialog.error({
      content: `"${row.Name}" 파일을 삭제하시겠습니까?`,
      negativeText: '취소',
      positiveText: '삭제하기',
      async onPositiveClick() {
        try {
          await s3$.deleteFile(row.Key)
          const index = files.value.findIndex((item) => item.Key === row.Key)
          files.value.splice(index, 1)
          message.success(`"${row.Name}" 파일이 삭제되었습니다.`)
        } catch (error) {
          message.error(`"${row.Name}" 파일이 삭제에 실패하였습니다.`)
        }
      },
    })
  }
}

function onClickDirectory(file: any) {
  if (file.Key === '..') {
    const _path = route.path.split('/')
    const path = _path.slice(0, route.path.split('/').length - 1).join('/')

    navigateTo(path)

    return
  }

  navigateTo(`${route.path}/${file.Name.replace('/', '')}`)
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
  z-index: 1;

  font-size: 40px;
  color: #999;
}
</style>
