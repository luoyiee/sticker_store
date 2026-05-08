# 本地开发运行

## 安装依赖（首次或 package.json 变更后）

```bash
npm install
```

## 启动本地服务

```bash
npm run serve
```

启动后访问地址：

- 本机：http://localhost:8080
- 手机（同一 Wi-Fi）：http://<本机IP>:8080

> 查看本机 IP：`ipconfig getifaddr en0`

## 构建生产包

```bash
npm run build
```

输出到 `dist/`。

## 热更新

修改代码后 Ctrl+S 保存，浏览器自动刷新，无需重启服务。


## 目录结构

- `src/assets/` — 数据文件（`sticker_packs.json`）和图标（`svg/`、`svg-night/`）
- `src/res/` — 多语言字符串（`lang/`）、图片库（`image_library.js`）

## 注意

- 手机访问需和电脑在同一局域网（同一 Wi-Fi）
- vue.config.js 已配置 `host: '0.0.0.0'`，无需额外设置
- vconsole 调试面板在 App isTestMode 为 true 时显示