<template>
  <div id="app" :class="{ dark: isDark }">
    <router-view />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import * as jsBridgeManager from './manager/jsBridgeManager'
import * as trackerManager from './manager/trackerManager'
import { getWebviewInfo } from './utils'
import { initTabletDetection } from '@/ui'
import config from './config'

const store = useStore()
const router = useRouter()
const isDark = computed(() => store.state.isDark)

// 平板检测，监听窗口宽度变化
initTabletDetection(store)

// 系统深色主题监听
if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    store.commit('SET_DARK', e.matches)
  })
}

;(async () => {
  const { inJusTalk } = getWebviewInfo()
  if (!inJusTalk) {
    await store.dispatch('loadPacks')
    store.commit('SET_APP_READY')
    return
  }

  let webData = null
  try {
    webData = await jsBridgeManager.initWeb()
    jsBridgeManager.initVConsole(webData && webData.isTestMode)
    console.log('[initWeb]', JSON.stringify(webData))
    console.log('[App] version', process.env.VUE_APP_VERSION)
if (webData && webData.product) config.setAppType(webData.product)
    if (webData && webData.theme === 'dark') store.commit('SET_DARK', true)
    if (webData && webData.language) store.commit('SET_LANG', webData.language.slice(0, 2))
    if (webData && webData.traceData) trackerManager.replaceTraceData(webData.traceData)

    // 对齐 Flutter pxToDp：App 发来的都是物理像素，需除以 dpr 转为 CSS px
    const dpr = window.devicePixelRatio || 1
    const pxToDp = (val) => Math.round((Number(val) || 0) / dpr)

    // 安全区注入：写入 store 并同步到 CSS 变量，供所有页面使用
    const top = pxToDp(webData?.safeBarTop)
    const bottom = pxToDp(webData?.safeBarBottom)
    store.commit('SET_SAFE_AREA', { top, bottom })
    document.documentElement.style.setProperty('--safe-top', `${top}px`)
    document.documentElement.style.setProperty('--safe-bottom', `${bottom}px`)

    // 优先使用 App 提供的导航栏高度，对齐 Flutter AppConfig.topBarHeight
    const topBarHeight = pxToDp(webData?.topBarHeight)
    if (topBarHeight > 0) {
      document.documentElement.style.setProperty('--top-bar-height', `${topBarHeight}px`)
    }

    // 监听安全区动态变化
    jsBridgeManager.registerSafeBarChanged((updated) => {
      store.commit('SET_SAFE_AREA', updated)
      if (updated.top) document.documentElement.style.setProperty('--safe-top', `${updated.top}px`)
      if (updated.bottom) document.documentElement.style.setProperty('--safe-bottom', `${updated.bottom}px`)
    })

    // 初始化会员状态（任意会员类型有效即为会员）
    const now = config.serverNowMs()
    const isPremiumUser = [
      webData?.premiumDue,
      webData?.familyDue,
      webData?.myFamilyDue,
      webData?.platinumFamilyMemberDue,
      webData?.platinumFamilyOwnerDue,
    ].some(due => (parseInt(due) || 0) > now)
    store.commit('SET_USER_PREMIUM', isPremiumUser)

    // 监听会员变化（用户购买后 App 推送 getExpireDate）
    jsBridgeManager.registerMembershipChanged((isPremium) => {
      store.commit('SET_USER_PREMIUM', isPremium)
    })

    const jsBridgeVersion = parseInt(webData && webData.jsBridgeVersion) || 0
    if (jsBridgeVersion < config.minSupportVersion) {
      jsBridgeManager.loadingSuccess()
      router.replace('/unsupported')
      return
    }
  } catch { /* 非 App 环境忽略 */ }
  await store.dispatch('loadPacks')
  jsBridgeManager.loadingSuccess()
  jsBridgeManager.markSceneRead()
  jsBridgeManager.getAddedStickerPacks().then(addedIds => {
    if (addedIds && addedIds.length) store.dispatch('initAddedIds', addedIds)
  })
  // URL 带 page=detail&packId=xxx 时直接落地详情页
  const params = new URLSearchParams(window.location.search)
  console.log('[App] page param:', params.get('page'), 'packId:', params.get('packId'))
  if (params.get('page') === 'detail') {
    const packId = params.get('packId')
    const exists = store.getters.localizedPacks.some(p => p.packId == packId)
    console.log('[App] packId:', packId, 'exists:', exists, 'packs count:', store.getters.localizedPacks.length)
    if (packId && exists) {
      await router.replace('/')
      await router.push({ path: `/detail/${packId}`, state: { noAnimation: true } })
    }
  }
  store.commit('SET_APP_READY')
})()
</script>

<style lang="scss">
@import '@/ui/res/color_style';
@import '@/ui/res/text_style';
@import '@/ui/res/transition_style';
@import '@/ui/res/layout_style';

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
  -webkit-user-select: none;
  user-select: none;
}

input, textarea, [contenteditable] {
  -webkit-user-select: text;
  user-select: text;
}

html, body, #app {
  height: 100%;
  width: 100%;
  overflow-x: hidden;
  touch-action: pan-y;
  overscroll-behavior-x: none;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 安全区 CSS 变量默认值（App 环境会被 jsBridge 数据覆盖） */
:root {
  --safe-top: env(safe-area-inset-top, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --top-bar-height: 56px; /* App 提供 topBarHeight 时会覆盖此值 */
}

#app {
  background-color: -color;
  color: var(--text-color);
  transition: background-color 0.2s, color 0.2s;

  &.dark {
    background-color: -bg-color;
    color: -text-color;
  }
}

/* 平板内容居中容器，最大宽度 680px */
.content-container {
  width: 100%;
  max-width: $content-max-width;
  margin: 0 auto;
}
</style>
