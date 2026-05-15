<template>
  <div class="detail-page" :class="{ dark: isDark }">

    <div v-if="coverReady" class="scroll-body">

      <!-- 封面 -->
      <div class="cover-wrap">
        <div v-if="coverUrl" class="sticker-wrapper cover-wrapper shimmer-host">
          <img :ref="el => loadSticker(el, coverUrl, 'cover')" :src="placeholderSrc" class="cover-img" :class="{ loaded: loadedMap['cover'] }" alt="cover" />
        </div>
      </div>

      <!-- 包名 + 类型图标 -->
      <h1 class="pack-name">
        {{ pack?.packName }}
        <img v-if="pack?.payType === 'paid'" class="premium-icon" :src="premiumIcon" alt="premium" />
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
            <img :ref="el => loadSticker(el, sticker.fileUrl, i)" :src="placeholderSrc" :alt="sticker.itemId" :class="{ loaded: loadedMap[i] }" />
          </div>
        </div>
      </div>

    </div>

    <!-- 底部按钮 -->
    <div v-if="pack" class="bottom-btn-wrap">
      <div v-if="pack?.payType === 'limitedFree' && !pack.isAdded" class="limited-label">
        <span>🔥</span>
        <span>{{ t('tagLimitedFree') }}</span>
      </div>
      <j-t-loading-button :is-dark="isDark" :disabled="pack.isAdded" @click="onAddClick">
        <template v-if="pack.isAdded">{{ t('added') }}</template>
        <template v-else-if="pack.payType === 'paid' && !store.state.isVip">{{ t('subscribe') }}</template>
        <template v-else>{{ t('addSticker') }}</template>
      </j-t-loading-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, reactive, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { addStickerPack, openMembership } from '@/manager/jsBridgeManager'
import { trackContentDetailShow, trackContentAdd, trackContentPurchase, trackContentPurchaseOK } from '@/manager/trackerManager'
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

watch(pack, (p) => {
  if (p) trackContentDetailShow({ contentId: p.contentId, payType: p.payType })
}, { immediate: true })

watch(coverUrl, (url) => {
  if (url !== undefined) coverReady.value = true
}, { immediate: true })
const premiumIcon = JTImageLibrary.premiumIcon(store.state.isDark)
const placeholderSrc = computed(() => JTImageLibrary.placeholder(isDark.value))
const loadedMap = reactive({})
const _observers = new Map()

function loadSticker(el, url, key) {
  if (!el || !url) return
  if (_observers.has(key)) return

  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return
    observer.disconnect()
    _observers.delete(key)
    const img = new Image()
    img.onload = () => {
      if (el) el.src = url
      loadedMap[key] = true
    }
    img.src = url
  }, { rootMargin: '100px' })

  observer.observe(el)
  _observers.set(key, observer)
}

onUnmounted(() => {
  _observers.forEach(o => o.disconnect())
  _observers.clear()
})

function onStickerTap(i) {
  // expandedIndex.value = expandedIndex.value === i ? null : i
}

async function onAddClick() {
  if (!pack.value) return
  if (pack.value.payType === 'paid' && !store.state.isVip) {
    pendingPremiumAdd.value = true
    trackContentPurchase({ contentId: pack.value.contentId, downloadFrom: 'detail' })
    openMembership(pack.value)
    return
  }
  trackContentAdd({ contentId: pack.value.contentId, payType: pack.value.payType, downloadFrom: 'detail' })
  const ok = await addStickerPack(pack.value)
  if (ok) store.dispatch('markAdded', pack.value.contentId)
}

// 用户购买会员后自动添加
watch(() => store.state.isVip, async (paid) => {
  if (!paid || !pendingPremiumAdd.value || !pack.value || pack.value.isAdded) return
  pendingPremiumAdd.value = false
  trackContentPurchaseOK({ contentId: pack.value.contentId, downloadFrom: 'detail', type: store.state.type })
  const ok = await addStickerPack(pack.value)
  if (ok) store.dispatch('markAdded', pack.value.contentId)
})
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
