<template>
  <NCard title="Add Workspace" closable>
    <NForm
      ref="formRef"
      :model="form"
      :rules="rules"
      :label-width="120"
      label-placement="left"
    >
      <NFormItem label="Icon" path="icon">
        <SelectIcon v-model:value="form.icon"></SelectIcon>
      </NFormItem>
      <NFormItem label="Name" path="name">
        <NInput v-model:value="form.name" />
      </NFormItem>
      <NFormItem label="API Version" path="apiVersion">
        <NCheckbox
          v-model:checked="useLatestVersion"
          label="Use Latest"
          @update:checked="onUpdateUseLatest"
        ></NCheckbox>
        <NInput
          v-if="useLatestVersion"
          value="latest"
          style="flex: 1"
          readonly
        ></NInput>
        <NDatePicker
          v-else
          v-model:value="form.apiVersion"
          :options="apiItems"
          :disabled="useLatestVersion"
          type="date"
          placeholder="Please Select"
          style="flex: 1"
        />
      </NFormItem>
      <NFormItem label="Region" path="region">
        <NSelect
          v-model:value="form.region"
          :options="regionItems"
          placeholder="Please Select"
        />
      </NFormItem>
      <NFormItem label="Access Key" path="accessKeyId">
        <NInput v-model:value="form.accessKeyId" />
      </NFormItem>
      <NFormItem label="Secret Key" path="secretAccessKey">
        <NInput
          v-model:value="form.secretAccessKey"
          type="password"
          show-password-on="mousedown"
        >
          <template #suffix>
            <NButton
              class="copy-button"
              type="tertiary"
              text
              circle
              @click="onClickCopy(form.secretAccessKey)"
            >
              <NIcon>
                <CopyOutline></CopyOutline>
              </NIcon>
            </NButton>
          </template>
        </NInput>
      </NFormItem>
    </NForm>

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
  NDatePicker,
  NForm,
  NSpace,
  NButton,
  NInput,
  NCard,
  useMessage,
  NFormItem,
  NIcon,
  NSelect,
  NCheckbox,
} from 'naive-ui'
import { useAuthStore } from '~/store/auth'
import { CopyOutline } from '@vicons/ionicons5'
import { useClipboard } from '@vueuse/core'

const emit = defineEmits(['close'])

const auth$ = useAuthStore()

const message = useMessage()

const { copy } = useClipboard()

const formRef = ref()

const form = reactive({
  icon: 'Earth',
  name: '',
  apiVersion: null as any,
  region: null,
  accessKeyId: '',
  secretAccessKey: '',
})

const useLatestVersion = ref(false)

function onUpdateUseLatest(checked: boolean) {
  console.log('onUpdateUseLatest', checked)

  form.apiVersion = checked ? 'latest' : null
}

const rules = ref({
  icon: { required: true },
  name: { required: true },
  apiVersion: { required: true },
  region: { required: true },
  accessKeyId: { required: true },
  secretAccessKey: { required: true },
})

const apiItems = ref([])

const regionItems = ref([
  { label: 'US East (Ohio)', value: 'us-east-2' },
  { label: 'US East (N. Virginia)', value: 'us-east-1' },
  { label: 'US West (N. California)', value: 'us-west-1' },
  { label: 'US West (Oregon)', value: 'us-west-2' },
  { label: 'Africa (Cape Town)', value: 'af-south-1' },
  { label: 'Asia Pacific (Hong Kong)', value: 'ap-east-1' },
  { label: 'Asia Pacific (Hyderabad)', value: 'ap-south-2' },
  { label: 'Asia Pacific (Jakarta)', value: 'ap-southeast-3' },
  { label: 'Asia Pacific (Melbourne)', value: 'ap-southeast-4' },
  { label: 'Asia Pacific (Mumbai)', value: 'ap-south-1' },
  { label: 'Asia Pacific (Osaka)', value: 'ap-northeast-3' },
  { label: 'Asia Pacific (Seoul)', value: 'ap-northeast-2' },
  { label: 'Asia Pacific (Singapore)', value: 'ap-southeast-1' },
  { label: 'Asia Pacific (Sydney)', value: 'ap-southeast-2' },
  { label: 'Asia Pacific (Tokyo)', value: 'ap-northeast-1' },
  { label: 'Canada (Central)', value: 'ca-central-1' },
  { label: 'Europe (Frankfurt)', value: 'eu-central-1' },
  { label: 'Europe (Ireland)', value: 'eu-west-1' },
  { label: 'Europe (London)', value: 'eu-west-2' },
  { label: 'Europe (Milan)', value: 'eu-south-1' },
  { label: 'Europe (Paris)', value: 'eu-west-3' },
  { label: 'Europe (Spain)', value: 'eu-south-2' },
  { label: 'Europe (Stockholm)', value: 'eu-north-1' },
  { label: 'Europe (Zurich)', value: 'eu-central-2' },
  { label: 'Israel (Tel Aviv)', value: 'il-central-1' },
  { label: 'Middle East (Bahrain)', value: 'me-south-1' },
  { label: 'Middle East (UAE)', value: 'me-central-1' },
  { label: 'South America (São Paulo)', value: 'sa-east-1' },
  { label: 'AWS GovCloud (US-East)', value: 'us-gov-east-1' },
  { label: 'AWS GovCloud (US-West)', value: 'us-gov-west-1' },
])

function onSelectIcon(icon: string) {
  console.log('onSelectIcon', icon)

  form.icon = icon
}

function onClickCopy(input: string = '') {
  console.log('onClickCopy')
  copy(input)
  message.success('복사되었습니다.')
}

function onClickCancel() {
  emit('close')
}

function validateForm() {
  return new Promise((resolve, reject) => {
    formRef.value?.validate((errors?: any[]) => {
      if (!errors) {
        resolve(null)
      } else {
        reject('Invalid')
      }
    })
  })
}

async function onClickSave() {
  try {
    await validateForm()

    emit('close')

    auth$.addWorkspace({
      name: form.name,
      icon: form.icon,
      s3Config: {
        apiVersion: form.apiVersion,
        region: form.region,
        credentials: {
          accessKeyId: form.accessKeyId,
          secretAccessKey: form.secretAccessKey,
        },
      },
    })

    message.success('저장되었습니다.')
  } catch (error: any) {
    message.error(error.toString())
  }
}
</script>

<style lang="scss" scoped>
.n-card {
  max-width: 500px;
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
