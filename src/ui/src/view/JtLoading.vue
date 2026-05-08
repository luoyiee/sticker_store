<template>
  <!-- withMask：带半透明蒙层居中显示，否则只显示小球 -->
  <div v-if="withMask" class="jt-loading-mask">
    <div class="jt-loading-dots">
      <span v-for="(color, i) in colors" :key="i" class="jt-loading-ball" :style="ballStyle(i, color)" />
    </div>
  </div>
  <div v-else class="jt-loading-dots">
    <span v-for="(color, i) in colors" :key="i" class="jt-loading-ball" :style="ballStyle(i, color)" />
  </div>
</template>

<script setup>
// 对齐 Flutter JTSuperLoadingView
// 三个彩球：ballSize=6，ballPadding=3，每球延迟 125ms 依次弹跳（scale 0.5→1.5）
const props = defineProps({
  ballSize:    { type: Number, default: 6 },
  ballPadding: { type: Number, default: 3 },
  withMask:    { type: Boolean, default: false },
})

// jsBallColors：#FEA602 / #FF5722 / #258FF3
const colors = ['#fea602', '#ff5722', '#258ff3']

function ballStyle(i, color) {
  return {
    width:  `${props.ballSize}px`,
    height: `${props.ballSize}px`,
    margin: `0 ${props.ballPadding}px`,
    backgroundColor: color,
    animationDelay: `${i * 125}ms`,
  }
}
</script>

<style scoped>
.jt-loading-mask {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.jt-loading-dots {
  display: flex;
  align-items: center;
  justify-content: center;
}

.jt-loading-ball {
  display: inline-block;
  border-radius: 50%;
  animation: jt-bounce 300ms linear infinite alternate;
}

/* scale 0.5 → 1.5，对齐 Flutter Tween(begin: 0.5, end: 1.5) + repeat(reverse: true) */
@keyframes jt-bounce {
  from { transform: scale(0.5); }
  to   { transform: scale(1.5); }
}
</style>
