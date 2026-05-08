import { createApp, h } from 'vue'
import JTDialog from '../view/JTDialog.vue'

function mountDialog(props) {
  return new Promise((resolve) => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    function cleanup() {
      app.unmount()
      container.remove()
    }

    const app = createApp({
      render: () => h(JTDialog, {
        ...props,
        modelValue: true,
        onConfirm: () => { cleanup(); resolve('confirm'); props.onConfirm?.() },
        onCancel:  () => { cleanup(); resolve('cancel');  props.onCancel?.() },
      }),
    })

    app.mount(container)
  })
}

/**
 * @param {object} options
 * @param {boolean} [options.isDark]
 * @param {string}  [options.title]
 * @param {string}  [options.message]
 * @param {string}  [options.confirmText]
 * @param {string}  [options.cancelText]
 * @param {boolean} [options.showCancel=false]
 * @param {boolean} [options.maskClosable=false]
 * @param {Function} [options.onConfirm]
 * @param {Function} [options.onCancel]
 * @returns {Promise<'confirm'|'cancel'>}
 */
export function showCommonDialog(options = {}) {
  return mountDialog({
    isDark:       options.isDark       ?? false,
    title:        options.title        ?? '',
    message:      options.message      ?? '',
    confirmText:  options.confirmText  ?? 'OK',
    cancelText:   options.cancelText   ?? 'Cancel',
    showCancel:   options.showCancel   ?? false,
    maskClosable: options.maskClosable ?? false,
    onConfirm:    options.onConfirm,
    onCancel:     options.onCancel,
  })
}