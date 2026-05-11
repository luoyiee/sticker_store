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
