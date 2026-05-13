<template>
  <div class="detail-page" :class="{ dark: isDark }">

    <div v-if="coverReady" class="scroll-body">

      <!-- 封面 -->
      <div class="cover-wrap">
        <div v-if="coverUrl" class="sticker-wrapper cover-wrapper shimmer-host">
          <div class="shimmer" :class="{ loaded: loadedMap['cover'] }" />
          <img :ref="el => loadSticker(el, coverUrl, 'cover')" :src="placeholderSrc" class="cover-img" :class="{ loaded: loadedMap['cover'] }" alt="cover" />
        </div>
      </div>

      <!-- 包名 + 类型图标 -->
      <h1 class="pack-name">
        {{ pack?.packName }}
        <img v-if="pack?.isPremium" class="premium-icon" :src="premiumIcon" alt="premium" />
      </h1>

      <!-- 描述 -->
      <p v-if="pack?.description" class="description">{{ pack.description }}</p>

      <div class="divider" />

      <!-- Sticker 网格：4列 -->
      <div v-if="pack" class="sticker-grid">
        <div
          v-for="(sticker, i) in pack.items"
          :key="sticker.itemId"
          class="sticker-cell"
          :class="{ dimmed: expandedIndex !== null && expandedIndex !== i, expanded: expandedIndex === i }"
          @click="onStickerTap(i)"
        >
          <div class="sticker-wrapper shimmer-host">
            <div class="shimmer" :class="{ loaded: loadedMap[i] }" />
            <img :ref="el => loadSticker(el, sticker.fileUrl, i)" :src="placeholderSrc" :alt="sticker.itemId" :class="{ loaded: loadedMap[i] }" />
          </div>
        </div>
      </div>

    </div>

    <!-- 底部按钮 -->
    <div v-if="pack" class="bottom-btn-wrap">
      <div v-if="pack?.isLimitedFree && !pack.isAdded" class="limited-label">
        <span>🔥</span>
        <span>{{ t('tagLimitedFree') }}</span>
      </div>
      <j-t-loading-button :is-dark="isDark" :disabled="pack.isAdded" @click="onAddClick">
        <template v-if="pack.isAdded">{{ t('added') }}</template>
        <template v-else-if="pack.isPremium && !store.state.isPremiumUser">{{ t('subscribe') }}</template>
        <template v-else>{{ t('addSticker') }}</template>
      </j-t-loading-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, reactive } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { addStickerPack, openMembership } from '@/manager/jsBridgeManager'
import { JTLoadingButton, JTImageLibrary } from '@/ui'

const store = useStore()
const route = useRoute()
const { t } = useI18n()

const expandedIndex = ref(null)
const pendingPremiumAdd = ref(false)
const coverReady = ref(false)

const isDark = computed(() => store.state.isDark)
const pack = computed(() => store.getters.localizedPacks.find(p => p.contentId === route.params.contentId) ?? null)
const coverUrl = computed(() => pack.value?.coverUrl ?? null)

watch(coverUrl, (url) => {
  if (url !== undefined) coverReady.value = true
}, { immediate: true })
const premiumIcon = JTImageLibrary.premiumIcon(store.state.isDark)
const placeholderSrc = computed(() => JTImageLibrary.placeholder(isDark.value))
const loadedMap = reactive({})

function loadSticker(el, url, key) {
  if (!el || !url) return
  const img = new Image()
  img.onload = () => {
    if (el) el.src = url
    loadedMap[key] = true
  }
  img.src = url
}

function onStickerTap(i) {
  // expandedIndex.value = expandedIndex.value === i ? null : i
}

async function onAddClick() {
  if (!pack.value) return
  if (pack.value.isPremium && !store.state.isPremiumUser) {
    pendingPremiumAdd.value = true
    openMembership()
    return
  }
  const ok = await addStickerPack(pack.value)
  if (ok) store.dispatch('markAdded', pack.value.contentId)
}

// 用户购买会员后自动添加
watch(() => store.state.isPremiumUser, async (isPremium) => {
  if (!isPremium || !pendingPremiumAdd.value || !pack.value || pack.value.isAdded) return
  pendingPremiumAdd.value = false
  const ok = await addStickerPack(pack.value)
  if (ok) store.dispatch('markAdded', pack.value.contentId)
})
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
