<template>
  <div class="backgroub-overlay">
    <slot></slot>
  </div>
</template>

<style scoped>
.backgroub-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.4);
  border: 1px solid #313131;
  border-radius: 0.25rem;
}
</style>
