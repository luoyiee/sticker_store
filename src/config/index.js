const appConfig = {
  minSupportVersion: 3,
  updateUrl: 'https://www.justalk.com/dl',
  appType: '',
  setAppType(type) { appConfig.appType = type },
  isKids() { return appConfig.appType === 'kids' },
  isFamily() { return appConfig.appType === 'family' },
  isJusTalk() { return appConfig.appType === 'justalk' },

  // 同步时刻的服务器时间（ms since epoch）及对应的单调时间戳
  _syncedServerMs: 0,
  _syncedMonotonicMs: 0,
  setServerTime(serverTimeMs) {
    appConfig._syncedServerMs = serverTimeMs
    appConfig._syncedMonotonicMs = performance.now()
  },
  // 用服务器校准后的当前时间（ms since epoch），不受本地时钟修改影响
  serverNowMs() {
    if (!appConfig._syncedServerMs) return Date.now()
    return appConfig._syncedServerMs + (performance.now() - appConfig._syncedMonotonicMs)
  },

}

export default appConfig
