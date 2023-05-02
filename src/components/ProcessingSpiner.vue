<template>
  <background-overlay>
    <div class="spiner-style"><div></div><div></div><div></div><div></div></div>
  </background-overlay>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import bg from './BackgroudOverlay.vue'

export default defineComponent({
  components: {
    'background-overlay': bg
  }
})
</script>

<style scoped>
.spiner-style {
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
}
.spiner-style div {
  box-sizing: border-box;
  display: block;
  position: absolute;
  width: 64px;
  height: 64px;
  margin: 8px;
  border: 8px solid #fed;
  border-radius: 50%;
  animation: spiner-style 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  border-color: #fed transparent transparent transparent;
}
.spiner-style div:nth-child(1) {
  animation-delay: -0.45s;
}
.spiner-style div:nth-child(2) {
  animation-delay: -0.3s;
}
.spiner-style div:nth-child(3) {
  animation-delay: -0.15s;
}
@keyframes spiner-style {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
