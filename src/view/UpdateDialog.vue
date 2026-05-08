<template><div /></template>

<script setup>
import { onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { finishWeb } from '@/jsBridge'
import { showCommonDialog } from '@/ui'
import config from '@/config'

const store = useStore()
const { t } = useI18n()
const isDark = computed(() => store.state.isDark)

onMounted(() => {
  showCommonDialog({
    isDark: isDark.value,
    title: t('unsupportedTitle'),
    message: t('unsupportedMessage'),
    confirmText: t('unsupportedUpdate'),
    cancelText: t('unsupportedCancel'),
    showCancel: true,
    onConfirm: () => window.open(config.updateUrl, '_blank'),
    onCancel: () => finishWeb(),
  })
})
</script>