import { createStore } from 'vuex'
import { localizedText, detectLang } from '@/utils'
import stickerPacks from '@/assets/generated_sticker_packs.json'

export default createStore({
  state: {
    packs: [],
    addedPackIds: new Set(),
    lang: detectLang(),
    isDark: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches,
    filterIndex: 0,
    isTablet: false,
    safeBarTop: 0,
    safeBarBottom: 0,
    isPremiumUser: false,
    appReady: false,
  },
  getters: {
    localizedPacks(state) {
      return state.packs.map(p => ({
        ...p,
        packName: localizedText(p.names, state.lang),
        description: localizedText(p.descriptions, state.lang),
        isAdded: state.addedPackIds.has(p.contentId),
        isNew: p.tags.includes('new'),
        isFree: p.tags.includes('free') || p.tags.includes('limitedFree'),
        isPremium: p.tags.includes('paid'),
        isLimitedFree: p.tags.includes('limitedFree'),
      }))
    },
    filteredPacks(state, getters) {
      const { filterIndex } = state
      if (filterIndex === 1) return getters.localizedPacks.filter(p => p.isFree)
      if (filterIndex === 2) return getters.localizedPacks.filter(p => p.isPremium)
      return getters.localizedPacks
    },
  },
  mutations: {
    SET_PACKS(state, packs) {
      state.packs = packs
    },
    SET_ADDED_IDS(state, ids) {
      state.addedPackIds = new Set(ids)
    },
    ADD_PACK_ID(state, contentId) {
      const next = new Set(state.addedPackIds)
      next.add(contentId)
      state.addedPackIds = next
    },
    SET_FILTER(state, index) {
      state.filterIndex = index
    },
    SET_LANG(state, lang) {
      state.lang = lang
    },
    SET_DARK(state, val) {
      state.isDark = val
    },
    SET_TABLET(state, val) {
      state.isTablet = val
    },
    SET_SAFE_AREA(state, { top, bottom }) {
      if (top != null) state.safeBarTop = top
      if (bottom != null) state.safeBarBottom = bottom
    },
    SET_USER_PREMIUM(state, val) {
      state.isPremiumUser = val
    },
    SET_APP_READY(state) {
      state.appReady = true
    },
  },
  actions: {
    loadPacks({ commit }) {
      commit('SET_PACKS', stickerPacks)
    },
    initAddedIds({ commit }, ids) {
      commit('SET_ADDED_IDS', ids)
    },
    markAdded({ commit }, contentId) {
      commit('ADD_PACK_ID', contentId)
    },
  },
})
