<template>
  <NCard title="Edit Workspace" closable @close="$emit('close')">
    <NDataTable :columns="columns" :data="data"></NDataTable>

    <template #action>
      <NSpace justify="end">
        <NButton type="tertiary" @click="onClickCancel">Cancel</NButton>
        <NButton type="primary" @click="onClickSave">Save</NButton>
      </NSpace>
    </template>
  </NCard>
</template>

<script lang="ts" setup>
import {
  NDataTable,
  NSpace,
  NButton,
  NCard,
  useMessage,
  NInput,
  NIcon,
} from 'naive-ui'
import { useAuthStore } from '~/store/auth'
import { CopyOutline, TrashBinOutline } from '@vicons/ionicons5'
import { useClipboard } from '@vueuse/core'
import SelectIcon from '~/components/SelectIcon.vue'
import { cloneDeep } from 'lodash'

const emit = defineEmits(['close'])

const auth$ = useAuthStore()
const message = useMessage()
const { copy } = useClipboard()

const columns = ref([
  {
    title: 'Icon',
    key: 'icon',
    render(row: any) {
      return h(SelectIcon, {
        value: row.icon || 'Earth',
        'onUpdate:value': (icon: string) => onUpdateIcon(row, icon),
      })
    },
  },
  { title: 'Name', key: 'name' },
  { title: 'API Version', key: 's3Config.apiVersion' },
  { title: 'Region', key: 's3Config.region' },
  { title: 'Access Key', key: 's3Config.credentials.accessKeyId' },
  {
    title: 'Secret Key',
    key: 's3Config.credentials.secretAccessKey',
    render(row: any) {
      return h(
        NInput,
        {
          type: 'password',
          value: row.s3Config.credentials.secretAccessKey,
          readonly: true,
          showPasswordOn: 'mousedown',
        },
        {
          suffix: () =>
            h(
              NButton,
              { text: true, circle: true, style: { marginRight: '8px' } },
              () =>
                h(NIcon, null, () =>
                  h(CopyOutline, {
                    onClick: () =>
                      onClickCopy(row.s3Config.credentials.secretAccessKey),
                  }),
                ),
            ),
        },
      )
    },
  },
  {
    key: 'etc',
    render(row: any) {
      return h(
        NButton,
        {
          type: 'error',
          text: true,
          circle: true,
          style: { marginRight: '8px' },
        },
        () =>
          h(NIcon, null, () =>
            h(TrashBinOutline, {
              onClick: () => onClickDeleteRow(row),
            }),
          ),
      )
    },
  },
])
const data = ref(cloneDeep(markRaw(auth$.workspaces)))

function onUpdateIcon(row: any, icon: string) {
  console.log('onUpdateIcon', row, icon)

  row.icon = icon
}

function onClickCopy(input: string = '') {
  console.log('onClickCopy')
  copy(input)
  message.success('복사되었습니다.')
}

function onClickDeleteRow(item: any) {
  console.log('onClickDeleteRow', item)
  const index = data.value.findIndex((_item) => _item.name === item.name)
  data.value.splice(index, 1)
}

function onClickCancel() {
  emit('close')
}

function onClickSave() {
  auth$.workspaces = data.value
  emit('close')
  message.success('저장되었습니다.')
}
</script>

<style lang="scss" scoped>
.n-card {
  max-width: 1000px;
}

.copy-button {
  margin-right: 8px;
}

.add-workspace__input-row {
  display: flex;
  align-items: center;

  gap: 16px;
  width: 100%;
}
</style>
