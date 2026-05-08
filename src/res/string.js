import { createI18n } from 'vue-i18n'
import { detectLang } from '@/utils'
import en    from './lang/en'
import zh    from './lang/zh'
import zh_TW from './lang/zh_TW'
import ja    from './lang/ja'
import ko    from './lang/ko'
import ar    from './lang/ar'
import de    from './lang/de'
import es    from './lang/es'
import fr    from './lang/fr'
import hi    from './lang/hi'
import id    from './lang/id'
import it    from './lang/it'
import nl    from './lang/nl'
import pt    from './lang/pt'
import ru    from './lang/ru'
import tr    from './lang/tr'
import vi    from './lang/vi'

const LOCALE_MAP = {
  'zh':      'zh',
  'zh-Hans': 'zh',
  'zh_CN':   'zh',
  'zh-Hant': 'zh_TW',
  'zh_TW':   'zh_TW',
  'ja':      'ja',
  'ko':      'ko',
  'ar':      'ar',
  'de':      'de',
  'es':      'es',
  'fr':      'fr',
  'hi':      'hi',
  'id':      'id',
  'it':      'it',
  'nl':      'nl',
  'pt':      'pt',
  'ru':      'ru',
  'tr':      'tr',
  'vi':      'vi',
}

export function toLocaleKey(lang) {
  if (!lang) return 'en'
  if (LOCALE_MAP[lang]) return LOCALE_MAP[lang]
  const prefix = lang.replace('_', '-').split('-')[0].toLowerCase()
  for (const [key, val] of Object.entries(LOCALE_MAP)) {
    if (key.toLowerCase() === prefix) return val
  }
  return 'en'
}

const i18n = createI18n({
  legacy: false,
  locale: toLocaleKey(detectLang()),
  fallbackLocale: 'en',
  messages: { en, zh, zh_TW, ja, ko, ar, de, es, fr, hi, id, it, nl, pt, ru, tr, vi },
})

export default i18n
