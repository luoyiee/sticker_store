import { createApp } from 'vue'
import App from './App.vue'
import router, { setupRouterTitle } from './router'
import store from './store'
import i18n, { toLocaleKey } from './res/string'
import { vRipple } from './directives/ripple'

const app = createApp(App)
app.use(router).use(store).use(i18n)
app.directive('ripple', vRipple)

setupRouterTitle(i18n)

// 保持 store 的 lang 与 i18n locale 同步，语言切换时同步刷新浏览器标题
store.watch(
  (state) => state.lang,
  (lang) => {
    i18n.global.locale.value = toLocaleKey(lang)
    const titleKey = router.currentRoute.value.meta?.titleKey
    if (titleKey) document.title = i18n.global.t(titleKey)
  },
)

app.mount('#app')
