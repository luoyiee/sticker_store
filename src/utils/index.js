export function getWebviewInfo() {
  const u = window.navigator.userAgent
  const isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)
  return {
    deviceType: isIOS ? 'ios' : 'android',
    inJusTalk: u.toLowerCase().indexOf('justalk') !== -1,
  }
}

// 从浏览器 locale 或 URL 参数中获取语言
export function detectLang() {
  const urlLang = new URLSearchParams(window.location.search).get('lang')
  const lang = urlLang || navigator.language || 'en'
  const short = lang.slice(0, 2)
  if (short === 'zh') return 'zh-Hans'
  return short
}

// 从多语言对象中取当前语言文案，fallback 到 en
export function localizedText(value, lang) {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (value[lang]) return value[lang]
  // 前缀匹配：App 传来短码如 'zh' 时能匹配 'zh-Hans'
  const prefix = Object.keys(value).find(k => k.startsWith(lang))
  return value[prefix] || value.en || Object.values(value)[0] || ''
}
