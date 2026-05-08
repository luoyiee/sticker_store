# CSS 命名规范参考

## 1. CSS 自定义属性（变量）命名

**官方文档**：[MDN — Using CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)

**推荐格式**：`--{category}-{variant}`

```css
/* 好 */
--text-color
--text-color-sub
--bg-color
--bg-color-secondary

/* 差 */
--text        /* 不知道是颜色还是内容 */
--subText     /* 不知道是什么类型的值 */
```

---

## 2. Material Design 3 颜色角色命名

**官方文档**：[Material Design 3 — Color roles](https://m3.material.io/styles/color/roles)

Flutter 侧已在用 M3，H5 建议对齐。核心概念：

| M3 Token | 含义 | 本项目对应 |
|---|---|---|
| `on-surface` | 主文字色 | `--text-color` |
| `on-surface-variant` | 次级文字色 | `--text-color-sub` |
| `primary` | 主题色 | `--theme-color` |
| `surface` | 背景色 | `--bg-color` |
| `surface-container` | 次级背景 | `--bg-color-secondary` |
| `outline` | 分割线 | `--divider-color` |

---

## 3. SCSS 变量命名

SCSS 变量应能一眼看出值的类型：

```scss
/* 好 */
$text-color:     #262626;   // 明确是颜色
$text-color-sub: #aaaaaa;
$bg-color:       #ffffff;

/* 差 */
$text:    #262626;   // 以为是字符串
$sub-text: #aaaaaa;  // 同上
```

**原则**：变量名 = 用途 + 类型，颜色值统一加 `-color` 后缀。

---

## 4. 工具类（Utility Class）命名

**参考**：[Tailwind CSS — Adding custom styles](https://tailwindcss.com/docs/adding-custom-styles)

工具类命名格式：`{prefix}-{property}-{variant}`

```scss
/* 好 */
.jt-text-primary   { color: var(--text-color); }      // text = color property
.jt-text-secondary { color: var(--text-color-sub); }
.jt-bg-primary     { background: var(--bg-color); }

/* 差 */
.jt-text-primary   { color: $text; }   // 用静态变量，暗色模式不切换
```

**关键原则**：工具类内部必须用 CSS 变量（`var(--...)`），不能用 SCSS 变量（`$...`），否则暗色模式无效。

---

## 5. BEM 方法论（组件级命名）

**官方文档**：[BEM — Block Element Modifier](https://getbem.com/naming/)

工具类不适用 BEM，BEM 用于组件结构：

```scss
/* Block */
.sticker-card { }

/* Element */
.sticker-card__title { }
.sticker-card__thumb { }

/* Modifier */
.sticker-card--premium { }
.sticker-card--disabled { }
```
