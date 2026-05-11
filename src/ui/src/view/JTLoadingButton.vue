<template>
  <button
    v-ripple="isDark ? { color: '#ffffff', pressOpacity: 0.10 } : { color: '#ffffff', pressOpacity: 0.20 }"
    class="jt-btn"
    :class="[`jt-btn--${variant}`, { 'jt-btn--loading': loading, 'is-dark': isDark }]"
    :disabled="disabled || loading"
    @click="$emit('click')"
  >
    <!-- loading 时显示旋转圆圈 -->
    <span v-if="loading" class="jt-btn__spinner" />
    <span v-else class="jt-btn__text"><slot /></span>
  </button>
</template>

<script setup>
defineProps({
  variant: { type: String, default: 'primary' }, // primary | secondary | ghost
  loading:  { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  isDark:   { type: Boolean, default: false },
})
defineEmits(['click'])
</script>

<style lang="scss" scoped>
@import '@/ui/res/color_style';
@import '@/ui/res/text_style';
@import '@/ui/res/layout_style';

.jt-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: $btn-max-width;
  max-width: $content-max-width; // 对齐 Flutter buttonMaxWidth: 664（平板上限）
  height: 52px;
  border: none;
  border-radius: 100px;   // 对齐 Flutter isCute=false 的 100px 全圆角
  @include jt-headline-small3-bold-18;
  cursor: pointer;
  transition: opacity 0.15s;
  -webkit-tap-highlight-color: transparent;


  // ── primary（主按钮，红色） ──────────────────────
  &--primary {
    background-color: $theme-color;   // #FF2C55
    color: #fff;

    &.is-dark { background-color: $dark-theme-color; } // #EF6479

    &:disabled:not(.jt-btn--loading) {
      background-color: var(--btn-disabled-bg);
      color: var(--btn-disabled-text);
      cursor: not-allowed;
    }
  }

  // ── secondary（次级按钮，灰底） ─────────────────
  &--secondary {
    background-color: $btn-secondary-bg;
    color: var(--text-color-sub);

    &.is-dark {
      background-color: $dark-btn-secondary-bg;
      color: -text-color-sub;
    }

    &:disabled { opacity: 0.4; cursor: not-allowed; }
  }

  // ── ghost（透明边框） ────────────────────────────
  &--ghost {
    background-color: transparent;
    border: 1.5px solid $theme-color;
    color: $theme-color;

    &.is-dark { border-color: $dark-theme-color; color: $dark-theme-color; }
    &:disabled { opacity: 0.4; cursor: not-allowed; }
  }

  // ── loading 状态：背景色保持，禁止点击 ──────────
  &--loading { cursor: not-allowed; opacity: 0.85; }
}

// loading 旋转圆圈，对齐 Flutter CircularProgressIndicator
.jt-btn__spinner {
  display: inline-block;
  width: 24px;
  height: 24px;
  border: 2.5px solid $btn-spinner-border;
  border-top-color: #fff;
  border-radius: 50%;
  animation: jt-spin 0.9s linear infinite;
}

@keyframes jt-spin {
  to { transform: rotate(360deg); }
}

.jt-btn__text {
  pointer-events: none;
}
</style>
