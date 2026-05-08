# 已知问题与处理记录

## 打包产物中出现 .DS_Store 文件

### 现象

运维反馈打包后 dist 目录中存在 `.DS_Store` 文件。

### 原因

`.DS_Store` 是 macOS Finder 自动生成的隐藏文件，会出现在任何被访问过的目录中。`assets/` 目录被 webpack 整体处理，导致其中的 `.DS_Store` 也被复制进打包产物。

### 处理

1. 删除 `assets/.DS_Store`
2. 在 `vue.config.js` 的 `chainWebpack` 中添加排除规则：

```js
config.module.rule('file').exclude.add(/\.DS_Store$/)
```

`.gitignore` 中已有 `.DS_Store`，后续本地不会提交该文件，但 webpack 不读 gitignore，所以需要单独配置排除。

---

## Android WebView 深色模式下背景色被强制反转

### 现象

深色模式下，页面中手动设置了明确背景色（如 `#D1FAE5`、`#FFEDD5`）的元素，实际渲染出来仍是深色，DevTools Computed 面板显示颜色值正确但视觉不生效。

### 原因

Android WebView 的**强制深色模式（Force Dark）**机制会对页面颜色自动做反转处理。当 WebView 检测到系统处于深色环境时，会将页面中的浅色背景自动变暗，覆盖 CSS 中显式设置的颜色值。iOS WKWebView 无此机制，不受影响。

### 处理

在 `public/index.html` 的 `<head>` 中添加：

```html
<meta name="color-scheme" content="light dark">
```

此 meta 标签告知 WebView 页面已自行处理深色模式，禁止系统强制反转颜色。
