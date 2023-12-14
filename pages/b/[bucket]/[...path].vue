<template>
  <div>prefix: {{ prefix }}</div>
  <div>$route.path: {{ $route.path }}</div>
  <div>$route.params: {{ $route.params }}</div>
  <NDataTable
    :loading="loading"
    :columns="columns"
    :data="filteredFiles"
  ></NDataTable>
</template>

<script lang="ts" setup>
import { NDataTable, NDropdown, NButton, NIcon, useMessage } from 'naive-ui'
import bytes from 'bytes'
import { useS3Store } from '~/store/s3'
import { EllipsisVertical } from '@vicons/ionicons5'

const route = useRoute()

const s3$ = useS3Store()

const message = useMessage()

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

function onSelectOption(row: any, value: any) {
  if (value === 'Download') {
    s3$.downloadFile(row.Key)
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
      (await s3$.getObjects({
        Prefix: prefix.value && `${prefix.value}/`,
      })) || []

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
