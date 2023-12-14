<template>
  <div class="wrapper">
    <NDataTable
      :loading="s3$.loading"
      :columns="columns"
      :data="s3$.buckets"
    ></NDataTable>
  </div>
</template>

<script lang="ts" setup>
import { NButton, NDataTable } from 'naive-ui'
import { useAuthStore } from '~/store/auth'
import { useS3Store } from '~/store/s3'

const s3$ = useS3Store()

const columns = ref([
  {
    title: 'Name',
    key: 'Name',
    render(row: any) {
      return h(
        NButton,
        { type: 'info', text: true, onClick: () => onClickBucket(row) },
        { default: () => row.Name },
      )
    },
  },
  {
    title: 'CreationDate',
    key: 'CreationDate',
    render(row: any) {
      const date = new Date(row.CreationDate)
      return date.toLocaleString()
    },
  },
])

function onClickBucket(item: any) {
  navigateTo(`/b/${item.Name}`)
}
</script>

<style lang="scss" scoped>
.wrapper {
  padding: 12px;
}
</style>
