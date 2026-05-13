/* eslint-disable no-console */
import JsBridge from 'h5-jsbridge'
import config from '@/config'
import { getWebviewInfo } from '@/utils'
import { traceSnapshot } from '@/manager/trackerManager'


function _callHandler(handlerName, data, callback) {
  const { inJusTalk } = getWebviewInfo()
  if (!inJusTalk) return
  console.log(`callHandler: ${handlerName}`, data !== undefined ? data : '')
  JsBridge.callHandler(handlerName, data, callback)
}

function _registerHandler(handlerName, callback) {
  const { inJusTalk } = getWebviewInfo()
  if (!inJusTalk) return
  console.log(`registerHandler: ${handlerName}`)
  JsBridge.registerHandler(handlerName, (data) => {
    if (typeof data === 'string') data = JSON.parse(data)
    console.log(`registerHandler callback: ${handlerName}`, data)
    callback(data)
  })
}

export function initWeb() {
  return new Promise((resolve) => {
    JsBridge.callHandler('initWeb', null, (data) => {
      if (typeof data === 'string') data = JSON.parse(data)
      if (data?.serverTime) config.setServerTime(Number(data.serverTime))
      resolve(data)
    })
  })
}

export function loadingSuccess() {
  _callHandler('loadingSuccess')
}

export function finishWeb() {
  console.log('finishWeb')
  _callHandler('finishWeb')
}

export function logEvent(eventName, keyAndValues) {
  const trackData = []
  Object.entries(keyAndValues).forEach(([k, v]) => {
    trackData.push(k, String(v))
  })
  _callHandler('logEvent', JSON.stringify({ eventName, keyAndValues: trackData }))
}

export function getAddedStickerPacks() {
  return new Promise((resolve) => {
    _callHandler('jtJsToApp', { action: 'getAddedStickerPacks' }, (data) => {
      console.log('getAddedStickerPacks response:', data)
      try {
        const result = typeof data === 'string' ? JSON.parse(data) : data
        resolve(Array.isArray(result) ? result : [])
      } catch {
        resolve([])
      }
    })
  })
}

export function addStickerPack(pack) {
  console.log(`addStickerPack contentId=${pack.contentId}`)
  return new Promise((resolve) => {
    _callHandler('jtJsToApp', {
      action: 'addStickerPack',
      body: pack,
    }, (result) => {
      console.log(`addStickerPack result=${result}`)
      resolve(String(result) === 'true')
    })
  })
}

const _appToJsHandlers = {}

function _ensureAppToJsDispatcher() {
  if (_appToJsHandlers._registered) return
  _appToJsHandlers._registered = true
  _registerHandler('jtAppToJs', (data) => {
    const handler = _appToJsHandlers[data?.action]
    if (handler) handler(data)
  })
}

export function registerSafeBarChanged(callback) {
  _ensureAppToJsDispatcher()
  let prevTop = 0
  let prevBottom = 0
  _appToJsHandlers['safeBarChanged'] = (data) => {
    const dpr = window.devicePixelRatio || 1
    const top = Math.round((Number(data.top) || 0) / dpr)
    const bottom = Math.round((Number(data.bottom) || 0) / dpr)
    const updated = {}
    if (top > 0 && top !== prevTop) { updated.top = prevTop = top }
    if (bottom > 0 && bottom !== prevBottom) { updated.bottom = prevBottom = bottom }
    if (Object.keys(updated).length === 0) return
    console.log('safeBarChanged', updated)
    callback(updated)
  }
}

export function registerMembershipChanged(callback) {
  _ensureAppToJsDispatcher()
  _appToJsHandlers['getExpireDate'] = (data) => {
    const premiumDue = parseInt(data.premiumDue) || 0
    callback(premiumDue > config.serverNowMs())
  }
}

export function initVConsole(isTestMode) {
  if (!isTestMode || isTestMode === '0' || isTestMode === 'false') return
  if (typeof VConsole !== 'undefined') {
    window.vConsole = new VConsole()
  }
}

export function reportSceneVersion() {
  const scene = config.scene
  const version = config.sceneVersion
  _callHandler('jtJsToApp', { action: 'reportSceneVersion', scene, version })
}

export function openMembership() {
  _callHandler('jtJsToApp', JSON.stringify({
    action: 'resolveVipAccess',
//    type: 'premium',
//    benefitId: 'stickers',
    traceData: traceSnapshot(),
  }))
}
