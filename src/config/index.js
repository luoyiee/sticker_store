const appConfig = {
  minSupportVersion: 3,
  updateUrl: 'https://www.justalk.com/dl',
  appType: '',
  setAppType(type) { appConfig.appType = type },
  isKids() { return appConfig.appType === 'kids' },
  isFamily() { return appConfig.appType === 'family' },
  isJusTalk() { return appConfig.appType === 'justalk' },

  // 本地时钟与服务器时钟的偏差（ms），serverTime - localTime
  serverTimeOffsetMs: 0,
  setServerTime(serverTimeMs) {
    appConfig.serverTimeOffsetMs = serverTimeMs - Date.now()
  },
  // 用服务器校准后的当前时间（ms since epoch）
  serverNowMs() {
    return Date.now() + appConfig.serverTimeOffsetMs
  },
}

export default appConfig
