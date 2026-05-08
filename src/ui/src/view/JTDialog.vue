<template>
  <Teleport to="body">
    <div v-if="modelValue" class="jt-dialog-mask" @click.self="onMaskClick">
      <div class="jt-dialog" :class="{ dark: isDark }">
        <h2 v-if="title" class="jt-dialog__title">{{ title }}</h2>
        <p v-if="message" class="jt-dialog__message">{{ message }}</p>
        <div class="jt-dialog__actions">
          <button class="jt-dialog__confirm" @click="onConfirm">{{ confirmText }}</button>
          <button v-if="showCancel" class="jt-dialog__cancel" @click="onCancel">{{ cancelText }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  isDark:      { type: Boolean, default: false },
  title:       { type: String,  default: '' },
  message:     { type: String,  default: '' },
  confirmText: { type: String,  default: 'OK' },
  cancelText:  { type: String,  default: 'Cancel' },
  showCancel:  { type: Boolean, default: false },
  maskClosable:{ type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

function onConfirm() {
  emit('confirm')
  emit('update:modelValue', false)
}

function onCancel() {
  emit('cancel')
  emit('update:modelValue', false)
}

function onMaskClick() {
  if (props.maskClosable) emit('update:modelValue', false)
}
</script>

<style lang="scss" scoped>
@import '@/ui/res/color_style';
@import '@/ui/res/text_style';

.jt-dialog-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.jt-dialog {
  width: calc(100% - 32px);
  max-width: 343px;
  background: $dialog-bg;
  border-radius: 20px;
  padding: 24px 16px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;

  &.dark {
    background: $dark-dialog-bg;

    .jt-dialog__title   { color: #ffffff; }
    .jt-dialog__message { color: #ffffff; }
    .jt-dialog__cancel  {
      color: $dark-dialog-cancel-text;
      background: $dark-dialog-cancel-bg;
    }
  }
}

.jt-dialog__title {
  @include jt-headline-small3-bold-18;
  color: var(--text-color);
  text-align: center;
}

.jt-dialog__message {
  @include jt-body-large-16;
  color: var(--text-color);
  text-align: center;
  margin-top: 15px;
  line-height: 1.5;
}

.jt-dialog__actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
  margin-top: 26px;
  padding-bottom: 16px;
}

.jt-dialog__confirm,
.jt-dialog__cancel {
  width: 216px;
  height: 52px;
  border-radius: 26px;
  border: none;
  @include jt-headline-small3-bold-18;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  transition: opacity 0.08s ease;
  &:active { opacity: 0.65; }
}

.jt-dialog__confirm {
  background: $theme-color;
  color: #ffffff;
}

.jt-dialog__cancel {
  background: $dialog-cancel-bg;
  color: $dialog-cancel-text;
}
</style>
