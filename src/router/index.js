import { createRouter, createWebHashHistory } from 'vue-router'
import StickerStore from '@/pages/StickerStorePage/index.vue'
import StickerDetail from '@/pages/StickerDetailPage/index.vue'
import UpdateDialog from '@/view/UpdateDialog.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: StickerStore,
      meta: { titleKey: 'homeTitle' },
      children: [
        { path: 'detail/:contentId', component: StickerDetail },
      ],
    },
    { path: '/unsupported', component: UpdateDialog },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

export function setupRouterTitle(i18n) {
  router.afterEach((to) => {
    if (to.meta?.titleKey) {
      document.title = i18n.global.t(to.meta.titleKey)
    }
  })
}

export default router
