import { MDCRipple } from '@material/ripple'

// 直接注入 CSS，绕过打包问题
if (typeof document !== 'undefined' && !document.getElementById('mdc-ripple-style')) {
  const style = document.createElement('style')
  style.id = 'mdc-ripple-style'
  style.textContent = `
@keyframes mdc-ripple-fg-radius-in{from{animation-timing-function:cubic-bezier(.4,0,.2,1);transform:translate(var(--mdc-ripple-fg-translate-start,0)) scale(1)}to{transform:translate(var(--mdc-ripple-fg-translate-end,0)) scale(var(--mdc-ripple-fg-scale,1))}}
@keyframes mdc-ripple-fg-opacity-in{from{animation-timing-function:linear;opacity:0}to{opacity:var(--mdc-ripple-fg-opacity,0)}}
@keyframes mdc-ripple-fg-opacity-out{from{animation-timing-function:linear;opacity:var(--mdc-ripple-fg-opacity,0)}to{opacity:0}}
.mdc-ripple-surface{--mdc-ripple-fg-size:0;--mdc-ripple-left:0;--mdc-ripple-top:0;--mdc-ripple-fg-scale:1;--mdc-ripple-fg-translate-end:0;--mdc-ripple-fg-translate-start:0;-webkit-tap-highlight-color:rgba(0,0,0,0);will-change:transform,opacity;position:relative;outline:none;overflow:hidden}
.mdc-ripple-surface::before,.mdc-ripple-surface::after{position:absolute;border-radius:50%;opacity:0;pointer-events:none;content:""}
.mdc-ripple-surface::before{transition:opacity 15ms linear,background-color 15ms linear;z-index:var(--mdc-ripple-z-index,1)}
.mdc-ripple-surface::after{z-index:var(--mdc-ripple-z-index,0)}
.mdc-ripple-surface.mdc-ripple-upgraded::before{transform:scale(var(--mdc-ripple-fg-scale,1))}
.mdc-ripple-surface.mdc-ripple-upgraded::after{top:0;left:0;transform:scale(0);transform-origin:center center}
.mdc-ripple-surface.mdc-ripple-upgraded--unbounded::after{top:var(--mdc-ripple-top,0);left:var(--mdc-ripple-left,0)}
.mdc-ripple-surface.mdc-ripple-upgraded--foreground-activation::after{animation:mdc-ripple-fg-radius-in 225ms forwards,mdc-ripple-fg-opacity-in 75ms forwards}
.mdc-ripple-surface.mdc-ripple-upgraded--foreground-deactivation::after{animation:mdc-ripple-fg-opacity-out 150ms;transform:translate(var(--mdc-ripple-fg-translate-end,0)) scale(var(--mdc-ripple-fg-scale,1))}
.mdc-ripple-surface::before,.mdc-ripple-surface::after{top:calc(50% - 100%);left:calc(50% - 100%);width:200%;height:200%}
.mdc-ripple-surface.mdc-ripple-upgraded::after{width:var(--mdc-ripple-fg-size,100%);height:var(--mdc-ripple-fg-size,100%)}
.mdc-ripple-surface[data-mdc-ripple-is-unbounded],.mdc-ripple-upgraded--unbounded{overflow:visible}
.mdc-ripple-surface[data-mdc-ripple-is-unbounded]::before,.mdc-ripple-surface[data-mdc-ripple-is-unbounded]::after,.mdc-ripple-upgraded--unbounded::before,.mdc-ripple-upgraded--unbounded::after{top:calc(50% - 50%);left:calc(50% - 50%);width:100%;height:100%}
.mdc-ripple-surface[data-mdc-ripple-is-unbounded].mdc-ripple-upgraded::before,.mdc-ripple-surface[data-mdc-ripple-is-unbounded].mdc-ripple-upgraded::after,.mdc-ripple-upgraded--unbounded.mdc-ripple-upgraded::before,.mdc-ripple-upgraded--unbounded.mdc-ripple-upgraded::after{top:var(--mdc-ripple-top,calc(50% - 50%));left:var(--mdc-ripple-left,calc(50% - 50%));width:var(--mdc-ripple-fg-size,100%);height:var(--mdc-ripple-fg-size,100%)}
.mdc-ripple-surface[data-mdc-ripple-is-unbounded].mdc-ripple-upgraded::after,.mdc-ripple-upgraded--unbounded.mdc-ripple-upgraded::after{width:var(--mdc-ripple-fg-size,100%);height:var(--mdc-ripple-fg-size,100%)}
.mdc-ripple-surface::before,.mdc-ripple-surface::after{background-color:var(--mdc-ripple-color,#000)}
.mdc-ripple-surface:hover::before,.mdc-ripple-surface.mdc-ripple-surface--hover::before{opacity:var(--mdc-ripple-hover-opacity,.04)}
.mdc-ripple-surface.mdc-ripple-upgraded--background-focused::before,.mdc-ripple-surface:not(.mdc-ripple-upgraded):focus::before{transition-duration:75ms;opacity:var(--mdc-ripple-focus-opacity,.12)}
.mdc-ripple-surface:not(.mdc-ripple-upgraded)::after{transition:opacity 150ms linear}
.mdc-ripple-surface:not(.mdc-ripple-upgraded):active::after{transition-duration:75ms;opacity:var(--mdc-ripple-press-opacity,.12)}
.mdc-ripple-surface.mdc-ripple-upgraded{--mdc-ripple-fg-opacity:var(--mdc-ripple-press-opacity,.12)}
.mdc-ripple-surface > *{position:relative;z-index:2}
`
  document.head.appendChild(style)
}

export const vRipple = {
  mounted(el, binding) {
    const computedStyle = getComputedStyle(el)
    el._rippleOpts = binding.value && typeof binding.value === 'object' ? binding.value : {}
    const unbounded = el._rippleOpts.unbounded ?? false

    el.classList.add('mdc-ripple-surface')
    el.style.webkitTapHighlightColor = 'transparent'
    if (computedStyle.position === 'static') el.style.position = 'relative'
    if (!unbounded) el.style.overflow = 'hidden'
    if (unbounded) el.setAttribute('data-mdc-ripple-is-unbounded', 'true')

    el.style.setProperty('--mdc-ripple-hover-opacity', '0')
    el.style.setProperty('--mdc-ripple-focus-opacity', '0')

    // 在 MDCRipple 初始化前注册，disabled 时阻断后续所有监听器（包括 MDCRipple 内部的）
    el.addEventListener('pointerdown', (e) => { if (el.disabled) e.stopImmediatePropagation() }, { capture: true })

    const ripple = new MDCRipple(el)
    el._ripple = ripple

    function applyTheme() {
      const dark = !!el.closest('.dark')
      const o = el._rippleOpts
      const color = o.color ?? (dark ? '#cccccc' : '#999999')
      const pressOpacity = o.pressOpacity ?? (dark ? '0.25' : '0.20')
      el.style.setProperty('--mdc-ripple-color', color)
      el.style.setProperty('--mdc-ripple-press-opacity', String(pressOpacity))
    }

    // capture 阶段触发，draggable 内部和普通按钮均适用
    el.addEventListener('pointerdown', (e) => { applyTheme(); ripple.activate(e) }, { capture: true, passive: true })
    el.addEventListener('pointerup', () => ripple.deactivate(), { capture: true, passive: true })
    el.addEventListener('pointercancel', () => ripple.deactivate(), { capture: true, passive: true })
  },
  updated(el, binding) {
    el._rippleOpts = binding.value && typeof binding.value === 'object' ? binding.value : {}
    if (!el.classList.contains('mdc-ripple-surface')) {
      el.classList.add('mdc-ripple-surface')
    }
    if (el._ripple && !el.classList.contains('mdc-ripple-upgraded')) {
      el.classList.add('mdc-ripple-upgraded')
      el._ripple.layout()
    }
  },
  unmounted(el) {
    el._ripple?.destroy()
  },
}
