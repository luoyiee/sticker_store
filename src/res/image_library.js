const _svg = require.context('@/assets/svg', false, /\.svg$/)
const _svgNight = require.context('@/assets/svg-night', false, /\.svg$/)

function svg(name) { return _svg(`./${name}.svg`) }
function svgNight(name) { return _svgNight(`./${name}.svg`) }

const _icPlaceholder = require('@/assets/images/sticker_placeholder.webp')
const _icPlaceholderNight = require('@/assets/images-night/sticker_placeholder.webp')

const _icPremiumTalk = svg('ic_premium_talk')
const _icPremiumTalkNight = svgNight('ic_premium_talk')
const _icPremiumFamily = svg('ic_premium_family')
const _icPremiumKids = svg('ic_premium_kids')
const _icPremiumKidsNight = svgNight('ic_premium_kids')

export const JTImageLibrary = {
  icPlaceholder: svg('ic_placeholder'),
  placeholder(isDark) { return isDark ? _icPlaceholderNight : _icPlaceholder },
  premiumIcon(isDark) {
    const appType = require('@/config').default.appType
    if (appType === 'family') return _icPremiumFamily
    if (appType === 'kids') return isDark ? _icPremiumKidsNight : _icPremiumKids
    return isDark ? _icPremiumTalkNight : _icPremiumTalk
  },
}
