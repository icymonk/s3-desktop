<template>
  <NSpace class="app-header" justify="space-between" align="center">
    <NSpace>
      <NBreadcrumb>
        <NBreadcrumbItem @click="onClickHome">
          <NDropdown
            :options="workspaceItems.length > 1 ? workspaceItems : []"
            @select="onSelectWorkspace"
          >
            <NButton
              type="info"
              text
              @click="onSelectWorkspace(auth$.currentWorkspace?.name)"
            >
              {{ auth$.currentWorkspace?.name }}
            </NButton>
          </NDropdown>
        </NBreadcrumbItem>

        <NBreadcrumbItem>
          <NDropdown
            :options="bucketItems.length > 1 ? bucketItems : []"
            @select="onSelectBucket"
          >
            <NButton
              type="info"
              text
              @click="onSelectBucket($route.params.bucket)"
            >
              {{ $route.params.bucket }}
            </NButton>
          </NDropdown>
        </NBreadcrumbItem>

        <NBreadcrumbItem v-for="(item, index) in breadcrumbItems">
          <NButton
            :type="breadcrumbItems.length === index + 1 ? 'default' : 'info'"
            text
            @click="onClickBreadcrumb(item, index)"
          >
            {{ item }}
          </NButton>
        </NBreadcrumbItem>
      </NBreadcrumb>
    </NSpace>

    <DevOnly>
      <div class="app-header__address">
        <NInput :value="$route.path" readonly></NInput>
      </div>
    </DevOnly>

    <NDropdown
      :options="localeOptions"
      size="small"
      trigger="hover"
      @select="onSelectLocale"
    >
      <NButton text circle>
        <template #icon>
          <NIcon>
            <EarthOutline></EarthOutline>
          </NIcon>
        </template>
      </NButton>
    </NDropdown>
  </NSpace>
</template>

<script lang="ts" setup>
import { EarthOutline } from '@vicons/ionicons5'
import {
  NButton,
  NSpace,
  NBreadcrumb,
  NBreadcrumbItem,
  NDropdown,
  NIcon,
  NInput,
} from 'naive-ui'
import { useAuthStore } from '~/store/auth'
import { useS3Store } from '~/store/s3'

const route = useRoute()

const auth$ = useAuthStore()
const s3$ = useS3Store()

const workspaceItems = computed(() =>
  auth$.workspaces.map((item) => ({ label: item.name, key: item.name })),
)

const bucketItems = computed(() =>
  s3$.buckets.map((item) => ({ label: item.Name, key: item.Name })),
)
const breadcrumbItems = computed(() =>
  route.path.split('/b/')[1]?.split('/').slice(1),
)

const localePath = useLocalePath()
const { locale, locales, setLocale, t } = useI18n()

const localeOptions = computed<any[]>(() =>
  locales.value.map((item) => ({
    label: t(item.toString()),
    key: item,
    disabled: item === locale.value,
  })),
)

function onSelectLocale(locale: any) {
  console.log('onSelectLocale', locale)

  setLocale(locale)
}

function onClickHome() {
  navigateTo(localePath('/'))
}

function onSelectBucket(bucket: any) {
  console.log('onSelectBucket')

  navigateTo(localePath(`/b/${bucket}`))
}

function onSelectWorkspace(workspace: any) {
  console.log('onSelectWorkspace!', workspace)

  auth$.currentKey = workspace
  navigateTo(localePath(`/b`))
}

function onClickBreadcrumb(item: any, index: number) {
  if (breadcrumbItems.value.length === index + 1) return

  console.log('onClickBreadcrumb', item)
  const _path = route.path.split('/b/')[1]?.split('/') || []
  const path = ['', 'b', ..._path.slice(index, _path.length - index - 1)]
  console.log(path.join('/'))

  navigateTo(localePath(path.join('/')))
}
</script>

<style lang="scss" scoped>
.app-header {
  padding: 16px;
}

.app-header__address {
  width: 100%;
  flex: 1;
}
</style>
