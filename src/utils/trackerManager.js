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

export function initVConsole(isTestMode) {
  if (!isTestMode || isTestMode === '0' || isTestMode === 'false') return
  if (typeof VConsole !== 'undefined') {
    window.vConsole = new VConsole()
  }
}
