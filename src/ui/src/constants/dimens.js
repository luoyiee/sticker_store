import { computed } from 'vue'
import { useStore } from 'vuex'

// 平板判断阈值，对齐 Flutter JTDimens.tabletMinWidth = 600
const TABLET_MIN_WIDTH = 600

export function useLayout() {
  const store = useStore()

  // 是否平板（响应式，窗口宽度 >= 600px）
  const isTablet = computed(() => store.state.isTablet)

  // 内容水平边距：phone=16 tablet=24，对齐 Flutter marginHorizontal
  const marginH = computed(() => isTablet.value ? 24 : 16)

  // 顶栏高度：phone=56 tablet=64，对齐 Flutter topBarHeight
  const topBarHeight = computed(() => isTablet.value ? 64 : 56)

  // 安全区，从 jsBridge initWebview 获取后存入 store
  const safeTop = computed(() => store.state.safeBarTop)
  const safeBottom = computed(() => store.state.safeBarBottom)

  return { isTablet, marginH, topBarHeight, safeTop, safeBottom }
}

// 初始化窗口宽度监听，在 App.vue 调用一次
export function initTabletDetection(store) {
  const check = () => {
    store.commit('SET_TABLET', window.innerWidth >= TABLET_MIN_WIDTH)
  }
  check()
  window.addEventListener('resize', check)
}
