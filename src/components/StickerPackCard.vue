<template>
  <div class="pack-card" :class="{ dark: isDark }">
    <div class="card-header">
      <div class="info">
        <div class="name-row">
          <span class="pack-name">{{ pack.packName }}</span>
          <img v-if="pack.payType === 'paid'" class="premium-icon" :src="premiumIcon" alt="premium" />
          <span class="name-row-spacer" />
          <span v-if="pack.isAdded" class="added-text">{{ t('added') }}</span>
          <button v-else v-ripple="isDark ? { color: '#ffffff', pressOpacity: 0.10 } : { color: '#ffffff', pressOpacity: 0.20 }" class="add-btn" @click.stop="onAdd">{{ t('add') }}</button>
        </div>
        <div v-if="pack.isNew || pack.payType === 'limitedFree'" class="badge-row">
          <span v-if="pack.isNew" class="tag new-tag">{{ t('tagNew') }}</span>
          <span v-if="pack.payType === 'limitedFree'" class="tag limited-tag">{{ t('tagLimitedFree') }}</span>
        </div>
      </div>
    </div>

    <div class="preview-row" :class="{ 'has-badge': pack.isNew || pack.payType === 'limitedFree' }">
      <div v-for="i in 6" :key="i" class="preview-cell" :class="{ 'phone-hidden': i === 6 }">
        <div v-if="pack.items[i - 1]" class="sticker-wrapper shimmer-host">
          <img
            :ref="el => loadSticker(el, pack.items[i - 1]?.fileUrl, i - 1)"
            :src="placeholderSrc"
            :alt="`sticker-${i}`"
            :class="{ loaded: loadedMap[i - 1] }"
          />
        </div>
      </div>
    </div>

    <div class="card-divider" />
  </div>
</template>

<script setup>
import { defineEmits, reactive, computed, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { JTImageLibrary } from '@/ui'


const props = defineProps({
  pack: { type: Object, required: true },
  isDark: { type: Boolean, default: false },
})

const { t } = useI18n()
const premiumIcon = JTImageLibrary.premiumIcon(props.isDark)
const placeholderSrc = computed(() => JTImageLibrary.placeholder(props.isDark))
const loadedMap = reactive({})
const _observers = new Map()

const emit = defineEmits(['add'])

function loadSticker(el, url, index) {
  if (!el || !url) return
  if (_observers.has(index)) return

  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      if (loadedMap[index]) return
      const img = new Image()
      img.onload = () => {
        if (el) el.src = url
        loadedMap[index] = true
      }
      img.src = url
    }
  }, { rootMargin: '100px' })

  observer.observe(el)
  _observers.set(index, observer)
}

onUnmounted(() => {
  _observers.forEach(o => o.disconnect())
  _observers.clear()
})


function onAdd() {
  emit('add', props.pack)
}
</script>

<style lang="scss" scoped>
@import './StickerPackCard';
</style>

