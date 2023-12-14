<template>
  <NMenu
    :value="auth$.currentKey"
    :options="menuOptions"
    @update:value="onUpdateValue"
  ></NMenu>
</template>

<script lang="ts" setup>
import { NMenu, NIcon, type MenuOption, NButton } from 'naive-ui'
import { useAuthStore } from '~/store/auth'
import * as icons from '@vicons/ionicons5'

const emit = defineEmits(['click:add', 'click:setting'])
const auth$ = useAuthStore()

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
  { label: '추가하기', key: 'add', icon: renderIcon(icons.AddOutline) },
  { label: '설정', key: 'setting', icon: renderIcon(icons.SettingsOutline) },
  // { label: '저장하기', key: 'save', icon: renderIcon(icons.SaveOutline) },
])

function onUpdateValue(key: string) {
  console.log('onUpdateValue')

  if (key === 'add') {
    return emit('click:add')
  } else if (key === 'setting') {
    return emit('click:setting')
  }
  // else if (key === 'save') {
  //   auth$.saveWorkspace()
  //   return
  // }

  auth$.currentKey = key

  navigateTo(`/b`)
}
</script>
