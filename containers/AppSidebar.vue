<template>
  <NMenu
    :value="auth$.currentKey"
    :options="menuOptions"
    @update:value="onUpdateValue"
  ></NMenu>
</template>

<script lang="ts" setup>
import { NMenu, NIcon, type MenuOption } from 'naive-ui'
import { useAuthStore } from '~/store/auth'
import * as icons from '@vicons/ionicons5'

const emit = defineEmits(['click:add', 'click:setting'])
const auth$ = useAuthStore()
const localePath = useLocalePath()
const { t } = useI18n()

function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const defaultIcon = renderIcon(icons.Earth)

const menuOptions = computed<MenuOption[]>(() => [
  ...auth$.workspaces.map((item) => ({
    label: item.name,
    key: item.name,
    icon: renderIcon(icons[item.icon as keyof typeof icons] || defaultIcon),
  })),
  { key: 'divider-1', type: 'divider' },
  { label: t('add'), key: 'add', icon: renderIcon(icons.AddOutline) },
  {
    label: t('setting'),
    key: 'setting',
    icon: renderIcon(icons.SettingsOutline),
  },
  // { label: '저장하기', key: 'save', icon: renderIcon(icons.SaveOutline) },
])

function onUpdateValue(key: string) {
  console.log('onUpdateValue')

  if (key === 'add') {
    return emit('click:add')
  } else if (key === 'setting') {
    return emit('click:setting')
  }

  auth$.currentKey = key

  navigateTo(localePath(`/b`))
}
</script>
