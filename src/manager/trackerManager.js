import JsBridge from 'h5-jsbridge'
import { getWebviewInfo } from '@/utils'
import { TrackerConstants } from '@/constants/trackerConstants'

// ── Trace 数据管理 ─────────────────────────────────────────────────────────────
let _traceData = {}

export function replaceTraceData(data) {
  if (!data || Object.keys(data).length === 0) return
  _traceData = { ...data }
}

export function traceSnapshot() {
  return { ..._traceData }
}

export function getTraceId() {
  return _traceData.traceId || ''
}

// ── 内部工具 ──────────────────────────────────────────────────────────────────
function _generateSpanId() {
  const bytes = Array.from({ length: 8 }, () => Math.floor(Math.random() * 256))
  return bytes.map(b => b.toString(16).padStart(2, '0')).join('')
}

function _getMutableTraceMap() {
  return {
    spanId: _generateSpanId(),
    ..._traceData,
  }
}

function _trackEvent(eventName, dataMap) {
  const { inJusTalk } = getWebviewInfo()
  if (!inJusTalk) return
  const params = JSON.stringify({ action: 'logEvent', eventName, keyAndValues: dataMap })
  console.log('[TrackerManager] logEvent', params)
  JsBridge.callHandler('jtJsToApp', params, null)
}

// ── 工具方法 ──────────────────────────────────────────────────────────────────

// ── 埋点方法 ──────────────────────────────────────────────────────────────────

/**
 * 用户在商城主页点击贴图包进入详情页
 * @param {string} contentId    — 内容唯一 ID，如 fullscreen_sticker
 * @param {string} contentType  — sticker | theme | sound
 * @param {string} payType      — free | premium | freeLimit
 */
export function trackContentClick({ contentId, payType }) {
  const map = _getMutableTraceMap()
  map.extra = { detail: TrackerConstants.extraDetail, contentType: TrackerConstants.contentType, contentId, payType }
  _trackEvent(TrackerConstants.eventNameContentClick, map)
}

/** 进入详情页时上报 */
export function trackContentDetailShow({ contentId, payType }) {
  const map = _getMutableTraceMap()
  map.extra = { detail: TrackerConstants.extraDetail, contentId, payType }
  _trackEvent(TrackerConstants.eventNameContentDetailShow, map)
}

/** 用户点击下载按钮时触发（列表 Add 或详情页 Add to My Stickers） */
export function trackContentAdd({ contentId, payType, downloadFrom }) {
  const map = _getMutableTraceMap()
  map.extra = { detail: TrackerConstants.extraDetail, contentType: TrackerConstants.contentType, contentId, payType, downloadFrom }
  _trackEvent(TrackerConstants.eventNameContentAdd, map)
}

/** 用户点击解锁按钮触发购买（非会员点击非限免贴图包） */
export function trackContentPurchase({ contentId, downloadFrom }) {
  const map = _getMutableTraceMap()
  map.extra = { contentType: TrackerConstants.contentType, contentId, downloadFrom }
  _trackEvent(TrackerConstants.eventNameContentPurchase, map)
}

/** 购买完成后上报 */
export function trackContentPurchaseOK({ contentId, downloadFrom, type }) {
  const map = _getMutableTraceMap()
  map.extra = { detail: TrackerConstants.extraDetail, contentType: TrackerConstants.contentType, contentId, downloadFrom, type }
  _trackEvent(TrackerConstants.eventNameContentPurchaseOK, map)
}
