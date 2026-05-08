<template>
  <div class="store-page" :class="{ dark: isDark }">
    <div v-show="appReady" class="app-bar">
      <span class="title">{{ t('homeTitle') }}</span>
    </div>

    <router-view v-slot="{ Component }">
      <transition :name="noAnimation ? '' : 'slide'">
        <component :is="Component" class="detail-view" />
      </transition>
    </router-view>

    <div v-show="appReady" class="pack-list">
      <sticker-pack-card
        v-for="pack in filteredPacks"
        :key="pack.packId"
        :pack="pack"
        :is-dark="isDark"
        @click="goDetail(pack)"
        @add="onAdd(pack)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { addStickerPack, openMembership } from '@/jsBridge'
import StickerPackCard from '@/components/StickerPackCard.vue'

const store = useStore()
const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const noAnimation = ref(false)
watch(() => route.path, () => {
  if (history.state?.noAnimation) {
    noAnimation.value = true
    history.replaceState({ ...history.state, noAnimation: false }, '')
  } else {
    noAnimation.value = false
  }
})

const isDark = computed(() => store.state.isDark)
const appReady = computed(() => store.state.appReady)
const filteredPacks = computed(() => store.getters.filteredPacks)
const pendingPremiumPackId = ref(null)

function goDetail(pack) {
  router.push(`/detail/${pack.packId}`)
}

async function onAdd(pack) {
  if (pack.isPremium && !store.state.isPremiumUser) {
    pendingPremiumPackId.value = pack.packId
    openMembership()
    return
  }
  const ok = await addStickerPack(pack)
  if (ok) store.dispatch('markAdded', pack.packId)
}

watch(() => store.state.isPremiumUser, async (isPremium) => {
  if (!isPremium || !pendingPremiumPackId.value) return
  const packId = pendingPremiumPackId.value
  pendingPremiumPackId.value = null
  const pack = store.getters.localizedPacks.find(p => p.packId === packId)
  if (!pack || pack.isAdded) return
  const ok = await addStickerPack(pack)
  if (ok) store.dispatch('markAdded', pack.packId)
})
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
