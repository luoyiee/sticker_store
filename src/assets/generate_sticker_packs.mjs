/**
 * 贴图包 JSON 生成脚本
 *
 * 用法:
 *   node assets/generate_sticker_packs.mjs
 *
 * 输入:
 *   src/json/stickers/          贴图包文件夹，每个子目录为一个贴图包
 *     <pack>/cover/<x>.webp     封面图（自动读取目录内实际文件名）
 *     <pack>/<sticker>.webp     贴图文件
 *   src/json/stickers.xml       旧版贴图配置，用于匹配 fileName 字段
 *
 * 输出:
 *   assets/generated_sticker_packs.json
 *
 * 自动生成的字段:
 *   packId / stickerId    Snowflake-like 唯一 ID（每次运行重新生成）
 *   coverUrl / fileUrl    CDN 链接，规则: https://oss.juscloud.com/justalk/stickers/<pack>/[cover/]<file>.webp
 *   md5                   文件 MD5 字节转 Base64，与 Android calculateMd5 + toBase64String 等价
 *   suffix/width/height   从 WebP 文件头解析（支持 VP8X 动图 / VP8 有损 / VP8L 无损）
 *   length                文件字节大小
 *   fileName              从 stickers.xml 匹配（nameKey 去前缀后与贴图文件名一致才写入，否则省略）
 *
 * 需设计后替换的字段（标注 TODO）:
 *   names / descriptions / tags
 */

import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const STICKERS_DIR = path.join(ROOT, 'src/json/stickers')
const XML_PATH = path.join(ROOT, 'src/json/stickers.xml')
const CDN_BASE = 'https://oss.juscloud.com/justalk/stickers'

// ── 设计文档定义的排序（包顺序 + 包内 item 顺序）─────────────────────────────
// 新增贴图包时在此追加，item 顺序以设计文档为准，不在列表中的文件排末尾

const PACK_ORDER = [
  'heycaby',
  'halloweenfun',
  'christmastime',
  'lovelypanda',
  'kittyandpuppy',
  'yearofrat',
  'funnyart',
  'movingemoji',
]

// contentId → stickers.xml 中 fileName 的中间段前缀，无对应的包不写 fileName
const PACK_XML_PREFIX = {
  movingemoji:   'smilies',
  funnyart:      'paintings',
  yearofrat:     'rats',
  kittyandpuppy: 'catdog',
  lovelypanda:   'panda',
  christmastime: 'christmas',
  halloweenfun:  'halloween',
}

const PACK_TAGS = {
  heycaby:       ['new', 'limitedFree'],
  halloweenfun:  ['paid'],
  christmastime: ['paid'],
  lovelypanda:   ['paid'],
  kittyandpuppy: ['paid'],
  yearofrat:     ['free'],
  funnyart:      ['free'],
  movingemoji:   ['free'],
}

const ITEM_ORDER = {
  heycaby: [
    'heycabyhi','heycabyok','heycabyno','heycabyhaha','heycabylove','heycabyyey',
    'heycabybye','heycabyomg','heycabynice','heycabymad','heycabycry','heycabyinmyeels',
    'heycabygoodnight','heycabyconfuse','heycabybleh','heycabydizziness',
  ],
  halloweenfun: [
    'halloweenfunhihalloween','halloweenfunpumpkin','halloweenfunmagicmood','halloweenfunghost',
    'halloweenfuncandy','halloweenfunbattytime','halloweenfunbatween','halloweenfunspider',
    'halloweenfunspidersquad','halloweenfunmagicpot','halloweenfuncastle','halloweenfuncandle',
  ],
  christmastime: [
    'christmastimeblessing','christmastimegift','christmastimemerrychristmas','christmastimesantacoming',
    'christmastimehello','christmastimechristmasparty','christmastimejinglebell','christmastimehappy',
    'christmastimereindeer','christmastimechristmastree','christmastimesnowman','christmastimechristmasstocking',
  ],
  lovelypanda: [
    'lovelypandalove','lovelypandawhat','lovelypandastare','lovelypandadance','lovelypandafacepalm',
    'lovelypandanice','lovelypandapassby','lovelypandacomfort','lovelypandaplease','lovelypandapinchface',
    'lovelypandatableclap','lovelypandaquestion','lovelypandawaiting','lovelypandastudy','lovelypandahappy',
    'lovelypandagiggle','lovelypandatearingup','lovelypandadrunk','lovelypandasleep','lovelypandashock',
  ],
  kittyandpuppy: [
    'kittyandpuppyhug','kittyandpuppygoodvibes','kittyandpuppyactcute','kittyandpuppyangry',
    'kittyandpuppycry','kittyandpuppyrelax','kittyandpuppygoodjob','kittyandpuppypanic',
    'kittyandpuppyquestion','kittyandpuppyunhappy','kittyandpuppyhappy','kittyandpuppysigh',
  ],
  yearofrat: [
    'yearofratredpacket','yearofratcuterat','yearofratlantern','yearofratratwithcheese',
    'yearofratliondancer','yearofratfortunebag','yearofratfirecracker','yearofratsweetdumplings',
  ],
  funnyart: [
    'funnyartno','funnyartnevermind','funnyartwhat','funnyartsneaky','funnyartrock','funnyartlove',
    'funnyartrelax','funnyartbored','funnyartokay','funnyartcomeon','funnyartletsdance','funnyartbang',
  ],
  movingemoji: [
    'movingemojilove','movingemojishock','movingemojihaha','movingemojisurprise','movingemojithumbsup',
    'movingemojicool','movingemojioh','movingemojilol','movingemojicry','movingemojismirk',
    'movingemojisad','movingemojikiss','movingemojiclap','movingemojiok','movingemojisweat',
    'movingemojipeace','movingemojithink','movingemojipoop','movingemojiangry','movingemojisleep',
    'movingemojitongue','movingemojisigh','movingemojidizzy','movingemojipanic','movingemojiwink',
    'movingemojismile','movingemojiadorable','movingemojiconcerned','movingemojipuke','movingemojiquestion',
    'movingemojiblush','movingemojino','movingemojibeckon','movingemojigrin','movingemojislight',
    'movingemojibye','movingemojiscold','movingemojinervous','movingemojisilent','movingemojitearingup',
    'movingemojishhh','movingemojilaugh','movingemojiwhistle','movingemojilie','movingemojihandshake',
    'movingemojisalute',
  ],
}

// ── Snowflake-like ID (简化版，基于时间戳+随机，保证本次运行内唯一) ──────────
let _idSeq = 0
function genId() {
  const ts = BigInt(Date.now())
  const seq = BigInt(++_idSeq)
  return String((ts << 22n) | (seq & 0xFFFn))
}

// ── MD5 → Base64 ──────────────────────────────────────────────────────────────
function fileMd5Base64(filePath) {
  const buf = fs.readFileSync(filePath)
  const md5 = crypto.createHash('md5').update(buf).digest()
  // Android Base64.DEFAULT 与标准 base64 相同（带换行符），trim() 去掉换行
  return md5.toString('base64')
}

// ── 解析 WebP 宽高 ─────────────────────────────────────────────────────────────
// 支持 VP8X（含动图）、VP8（有损）、VP8L（无损）
function readWebpSize(filePath) {
  const buf = fs.readFileSync(filePath)
  // RIFF....WEBP
  if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WEBP') {
    throw new Error(`Not a WebP file: ${filePath}`)
  }
  const chunkId = buf.toString('ascii', 12, 16)
  if (chunkId === 'VP8X') {
    // Extended WebP: width/height stored as (value+1) in 24-bit LE at offset 24 and 27
    const w = (buf[24] | (buf[25] << 8) | (buf[26] << 16)) + 1
    const h = (buf[27] | (buf[28] << 8) | (buf[29] << 16)) + 1
    return { width: w, height: h }
  } else if (chunkId === 'VP8 ') {
    // Lossy: frame tag at offset 23-24 contains width/height
    // Bitstream starts at offset 20; skip 3-byte frame tag
    const w = (buf[26] | (buf[27] << 8)) & 0x3FFF
    const h = (buf[28] | (buf[29] << 8)) & 0x3FFF
    return { width: w, height: h }
  } else if (chunkId === 'VP8L') {
    // Lossless: 4 bytes at offset 21 encode width-1 (14 bits) and height-1 (14 bits)
    const bits = buf[21] | (buf[22] << 8) | (buf[23] << 16) | (buf[24] << 24)
    const w = (bits & 0x3FFF) + 1
    const h = ((bits >> 14) & 0x3FFF) + 1
    return { width: w, height: h }
  }
  throw new Error(`Unknown WebP chunk: ${chunkId} in ${filePath}`)
}

// ── 解析 stickers.xml ─────────────────────────────────────────────────────────
// 返回:
//   prefixMap: XML前缀 → { nameKey → fileName }，按组分开，避免重名 key 互相覆盖
//   order: 按 XML 顺序的 nameKey 列表（smilies 组，用于 movingemoji 包内排序）
function loadXmlFileNameMap() {
  const xml = fs.readFileSync(XML_PATH, 'utf-8')
  const prefixMap = {} // e.g. { smilies: { haha: 'stickers_smilies_haha.json' }, ... }
  const order = []     // smilies 组的 key 顺序（movingemoji 包内排序用）

  const groupRe = /<group[^>]*>([\s\S]*?)<\/group>/g
  let gm
  while ((gm = groupRe.exec(xml)) !== null) {
    const groupBlock = gm[1]
    let groupPrefix = null
    const groupItems = {}
    const itemRe = /<item>([\s\S]*?)<\/item>/g
    let m
    while ((m = itemRe.exec(groupBlock)) !== null) {
      const block = m[1]
      const nameKeyMatch = block.match(/<nameKey>\s*(.*?)\s*<\/nameKey>/)
      const fileNameMatch = block.match(/<fileName>\s*(.*?)\s*<\/fileName>/)
      if (!nameKeyMatch || !fileNameMatch) continue
      const key = nameKeyMatch[1].replace(/[\[\]]/g, '').toLowerCase().replace(/\s+/g, '')
      groupItems[key] = fileNameMatch[1]
      if (!groupPrefix) {
        const parts = fileNameMatch[1].replace('.json', '').split('_')
        if (parts.length >= 3) groupPrefix = parts[1]
      }
    }
    if (groupPrefix) {
      prefixMap[groupPrefix] = groupItems
      // smilies 组用于 movingemoji 的 item 排序
      if (groupPrefix === 'smilies') order.push(...Object.keys(groupItems))
    }
  }
  return { prefixMap, order }
}

// ── 主逻辑 ─────────────────────────────────────────────────────────────────────
function main() {
  const { prefixMap, order: xmlOrder } = loadXmlFileNameMap()

  const packDirs = fs.readdirSync(STICKERS_DIR).filter(name => {
    const full = path.join(STICKERS_DIR, name)
    return fs.statSync(full).isDirectory()
  })

  const packs = []

  for (const contentId of packDirs) {
    const packDir = path.join(STICKERS_DIR, contentId)

    // 封面（自动读取 cover 目录内实际文件名）
    const coverDir = path.join(packDir, 'cover')
    const coverFiles = fs.existsSync(coverDir) ? fs.readdirSync(coverDir).filter(f => f.endsWith('.webp')) : []
    if (coverFiles.length === 0) console.warn(`[WARN] 封面目录为空: ${coverDir}`)
    const coverFileName = coverFiles[0] ?? `${contentId}.webp`
    const coverUrl = `${CDN_BASE}/${contentId}/cover/${coverFileName}`

    // 贴图文件排序：按设计文档 ITEM_ORDER 定义的顺序，不在列表中的排末尾
    const designOrder = ITEM_ORDER[contentId] ?? []
    const allWebpFiles = fs.readdirSync(packDir).filter(f => f.endsWith('.webp'))
    const webpFiles = allWebpFiles.sort((a, b) => {
      const ia = designOrder.indexOf(path.basename(a, '.webp'))
      const ib = designOrder.indexOf(path.basename(b, '.webp'))
      if (ia === -1 && ib === -1) return a.localeCompare(b)
      if (ia === -1) return 1
      if (ib === -1) return -1
      return ia - ib
    })

    const items = []
    for (const filename of webpFiles) {
      const filePath = path.join(packDir, filename)
      const itemId = path.basename(filename, '.webp') // e.g. "movingemojihaha"

      // 匹配 XML fileName：去掉贴图包前缀得到 stickerName，再查 map
      // e.g. "movingemojihaha" → strip contentId "movingemoji" → "haha"
      const stickerName = itemId.startsWith(contentId)
        ? itemId.slice(contentId.length)
        : itemId
      const expectedPrefix = PACK_XML_PREFIX[contentId]
      // 直接在该 contentId 对应的 XML 组里查，避免重名 key 跨组干扰
      const fileName = expectedPrefix
        ? (prefixMap[expectedPrefix]?.[stickerName] ?? null)
        : null

      const stat = fs.statSync(filePath)
      let width = 0, height = 0
      try {
        ;({ width, height } = readWebpSize(filePath))
      } catch (e) {
        console.warn(`[WARN] 无法读取尺寸: ${filePath} — ${e.message}`)
      }

      const md5Base64 = fileMd5Base64(filePath)

      const item = {
        stickerId: genId(),
        itemId,
        fileUrl: `${CDN_BASE}/${contentId}/${filename}`,
        md5: md5Base64,
        ...(fileName ? { fileName } : {}),
        names: {
          en: itemId,       // TODO: 设计提供替换
          'zh-Hans': itemId // TODO: 设计提供替换
        },
        suffix: 'webp',
        width,
        height,
        length: stat.size,
      }
      items.push(item)
    }

    const pack = {
      packId: genId(),
      contentId,
      names: {
        en: contentId,       // TODO: 设计提供替换
        'zh-Hans': contentId // TODO: 设计提供替换
      },
      descriptions: {
        en: `A set of ${contentId} stickers.`,         // TODO: 设计提供替换
        'zh-Hans': `${contentId} 贴图包。`              // TODO: 设计提供替换
      },
      coverUrl,
      tags: PACK_TAGS[contentId] ?? [],
      items,
    }
    const packIdx = PACK_ORDER.indexOf(contentId)
    packs.push({ ...pack, _packIdx: packIdx === -1 ? Infinity : packIdx })
    console.log(`✓ ${contentId}: ${items.length} 张贴图`)
  }

  // 按设计文档 PACK_ORDER 排包，不在列表中的排末尾
  packs.sort((a, b) => a._packIdx - b._packIdx)
  packs.forEach(p => delete p._packIdx)

  const outPath = path.join(ROOT, 'src/assets/generated_sticker_packs.json')
  fs.writeFileSync(outPath, JSON.stringify(packs, null, 2), 'utf-8')
  console.log(`\n输出: ${outPath}`)
  console.log(`共 ${packs.length} 个贴图包`)
}

main()
