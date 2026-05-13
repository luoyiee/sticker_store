# 贴图包 JSON 生成说明

## 概述

`assets/generate_sticker_packs.mjs` 用于根据本地贴图文件自动生成 `sticker_packs.json` 所需的真实数据，生成后人工核对并合并到 `src/assets/sticker_packs.json`。

## 运行

```bash
node assets/generate_sticker_packs.mjs
```

输出文件：`assets/generated_sticker_packs.json`

## 输入目录结构

```
src/json/stickers/
├── smiles/                  # 贴图包文件夹（contentId）
│   ├── cover/
│   │   └── smiles.webp      # 封面图（自动读取目录内实际文件名）
│   ├── smileshaha.webp      # 贴图文件
│   └── smileslove.webp
└── funnyart/
    ├── cover/
    │   └── funnyart.webp
    └── funnyartbang.webp

src/json/stickers.xml        # 旧版贴图配置，用于匹配 fileName 字段
```

## 字段生成规则

| 字段 | 生成方式 |
|------|----------|
| `packId` / `stickerId` | Snowflake-like 唯一 ID，首次生成后固定不变，新增贴图包时才重新生成 |
| `contentId` | 贴图包文件夹名 |
| `coverUrl` | `https://oss.juscloud.com/justalk/stickers/<pack>/cover/<文件名>.webp` |
| `fileUrl` | `https://oss.juscloud.com/justalk/stickers/<pack>/<文件名>.webp` |
| `md5` | 文件 MD5 字节 → Base64，与 Android `calculateMd5` + `toBase64String` 等价 |
| `suffix` | 固定为 `webp` |
| `width` / `height` | 从 WebP 文件头解析（支持 VP8X 动图 / VP8 有损 / VP8L 无损） |
| `length` | 文件字节大小 |
| `fileName` | 从 `stickers.xml` 匹配：去掉贴图包前缀后的名称与 XML `nameKey` 一致时写入，否则省略 |
| `names` / `descriptions` / `tags` | 占位符，**需设计提供后替换** |

## md5 说明

Android 端下载贴图后用以下方式校验完整性：

```java
byte[] md5 = calculateMd5(fileDescriptor);   // 计算本地文件 MD5
String base64 = toBase64String(md5);         // 转 Base64
// 与 JSON 中的 md5 字段比对
```

脚本生成的 `md5` 字段与上述逻辑等价，两端结果一致。

## 合并到 sticker_packs.json

1. 运行脚本，检查 `assets/generated_sticker_packs.json`
2. 核对 `coverUrl`、`width`/`height`、`fileName` 是否正确
3. 补充 `names`、`descriptions`、`tags`（设计提供）
4. 将数组内容追加到 `src/assets/sticker_packs.json`

## 注意事项

- `packId` / `stickerId` 合并进 `sticker_packs.json` 后即固定，后续新增贴图包时再运行脚本，已有数据不受影响
- 封面文件命名不规范（如 `heycabycover.webp`）不影响生成，脚本自动读取实际文件名
- `stickers.xml` 中无对应 `nameKey` 的贴图不带 `fileName` 字段，属正常情况
