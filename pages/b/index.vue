<template>
  <div class="wrapper">
    <NSpace class="table-header" justify="space-between" align="center">
      <h3>
        {{ $t('b.title') }}
        <span class="bucket-count">({{ s3$.buckets.length }})</span>
      </h3>

      <div class="table-header__actions">
        <NButton @click="onClickRefresh">
          <template #icon>
            <NIcon>
              <Refresh></Refresh>
            </NIcon>
          </template>
        </NButton>

        <NButton :disabled="!checkedRowKeys.length" @click="onClickEmpty">
          {{ $t('emptyBucket.button') }}
        </NButton>
        <NButton :disabled="!checkedRowKeys.length" @click="onClickDelete">
          {{ $t('delete') }}
        </NButton>
        <NButton type="warning" text-color="black" @click="onClickNew">
          {{ $t('createBucket.button') }}
        </NButton>
      </div>
    </NSpace>

    <NDataTable
      :loading="s3$.loading"
      :columns="columns"
      :data="s3$.buckets"
      :row-key="(row) => row.Name"
      @update:checked-row-keys="onChangeCheckedRow"
    ></NDataTable>
  </div>
</template>

<script lang="ts" setup>
import {
  NButton,
  NDataTable,
  NInput,
  NSpace,
  useDialog,
  useMessage,
  NIcon,
} from 'naive-ui'
import { useS3Store } from '~/store/s3'
import { Refresh } from '@vicons/ionicons5'

const dialog = useDialog()
const message = useMessage()
const localePath = useLocalePath()
const { t, d } = useI18n()

const s3$ = useS3Store()

const columns = computed<any[]>(() => [
  { type: 'selection', multiple: false },
  {
    title: t('name'),
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
    title: t('creationDate'),
    key: 'CreationDate',
    render(row: any) {
      const date = new Date(row.CreationDate)
      return d(date, 'long')
    },
  },
])

const checkedRowKeys = ref<string[]>([])

function onChangeCheckedRow(rowKeys: any[]) {
  console.log('onChangeCheckedRow', rowKeys)
  checkedRowKeys.value = rowKeys
}

const bucketInput = ref('')

function onClickRefresh() {
  console.log('onClickRefresh')
  s3$.fetchBuckets()
}

function onClickEmpty() {
  console.log('onClickEmpty')

  dialog.error({
    title: t('emptyBucket.title'),
    content: t('emptyBucket.contentMessage', { name: checkedRowKeys.value[0] }),
    negativeText: t('cancel'),
    positiveText: t('delete'),
    positiveButtonProps: { type: 'error' },
    async onPositiveClick() {
      try {
        await s3$.delBucket(checkedRowKeys.value[0])
        message.success(t('emptyBucket.successMessage'))
        s3$.fetchBuckets()
      } catch (error: any) {
        message.error(`${error.name}: ${error.message}`)
      }
    },
  })
}

async function onClickDelete() {
  console.log('onClickDelete')

  dialog.error({
    title: t('emptyBucket.title'),
    content: t('deleteBucket.contentMessage', {
      name: checkedRowKeys.value[0],
    }),
    negativeText: t('cancel'),
    positiveText: t('delete'),
    positiveButtonProps: { type: 'error' },
    async onPositiveClick() {
      try {
        await s3$.delBucket(checkedRowKeys.value[0])
        message.success(t('deleteBucket.successMessage'))
        s3$.fetchBuckets()
      } catch (error: any) {
        message.error(`${error.name}: ${error.message}`)
      }
    },
  })
}

function onClickNew() {
  bucketInput.value = ''

  const _dialog = dialog.success({
    title: t('createBucket.title'),
    negativeText: t('cancel'),
    positiveText: t('create'),
    content() {
      const input = h(NInput, {
        value: bucketInput.value,
        placeholder: t('createBucket.namePlaceholder'),
        passivelyActivated: true,
        onUpdateValue(value) {
          bucketInput.value = value
        },
        async onKeyup(e) {
          console.log('onKeyup', e)
          if (e.key !== 'Enter') return

          await addBucket(bucketInput.value)
          _dialog.destroy()
        },
        async onVnodeMounted() {
          await nextTick()
          input.el?.querySelector('input')?.focus()
        },
      })
      return h('div', null, input)
    },
    async onPositiveClick() {
      addBucket(bucketInput.value)
    },
  })
}

async function addBucket(name: string) {
  try {
    await s3$.addBucket(name)
    message.success(t('createBucket.successMessage'))
    s3$.fetchBuckets()
  } catch (error: any) {
    message.error(`${error.name}: ${error.message}`)
  }
}

function onClickBucket(item: any) {
  navigateTo(localePath(`/b/${item.Name}`))
}
</script>

<style lang="scss" scoped>
.wrapper {
  padding: 12px;
}

.table-header {
  padding: 8px;
}

.table-header__actions {
  display: flex;
  gap: 8px;
}

.bucket-count {
  color: #687078;
  font-weight: normal;
}
</style>
