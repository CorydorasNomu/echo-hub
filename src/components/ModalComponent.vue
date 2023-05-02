<template>
  <background-pverlay>
    <div class="modal-frame">
      <h2 v-if="modalTitle" :style="{ 'color': isErr ? 'firebrick' : '#B99B6B' }">{{ modalTitle }}</h2>
      <slot></slot>
      <div class="modal-footer">
        <std-button
          v-if="isCancelBtnVisible"
          style="margin-right: 20px;"
          :isInModal="true" :isOk="false"
          :label="cancelBtnLabel"
          :click="cancelCallback">
        </std-button>
        <std-button
          v-if="isOkBtnVisible"
          style="margin-left: 20px;"
          :isInModal="true"
          :label="okBtnLabel"
          :click="okCallback">
        </std-button>
      </div>
    </div>
  </background-pverlay>
</template>


<script lang="ts">
// Vue Module
import { defineComponent, ref, computed } from 'vue'
// UI Components
import bg from './BackgroudOverlay.vue'
import btn from './StandardButton.vue'
import { COMMON } from '@/constants/messages'

export default defineComponent({
  components: {
    'background-pverlay': bg,
    'std-button': btn
  },

  props: {
    // Props 型宣言
    title: { type: String, required: false, default: '' },
    isError: { type: Boolean, required: false, default: false },
    isOkVisible: { type: Boolean, required: false, default: true },
    isCancelVisible: { type: Boolean, required: false, default: true },
    okLabel: { type: String, required: false, default: COMMON.ok },
    cancelLabel: { type: String, required: false, default: COMMON.cancel },
    ok: {
      type: Function as import('vue').PropType<((...payload: any[]) => void) | undefined>,
      required: false,
      default: undefined
    },
    cancel: {
      type: Function as import('vue').PropType<((...payload: any[]) => void) | undefined>,
      required: false,
      default: undefined
    }
  },

  setup (props) {
    const modalTitle = computed(() => { return props.title || (props.isError ? COMMON.error : COMMON.confirm) })
    const isErr = ref(props.isError)
    const isOkBtnVisible = computed(() => props.isOkVisible)
    const isCancelBtnVisible = computed(() => props.isCancelVisible)
    const okBtnLabel = ref(props.okLabel)
    const cancelBtnLabel = ref(props.cancelLabel)
    const okCallback = ref(props.ok)
    const cancelCallback = ref(props.cancel)

    // テンプレートに公開
    return { COMMON, modalTitle, okBtnLabel, cancelBtnLabel, isErr, isOkBtnVisible, isCancelBtnVisible, okCallback, cancelCallback }
  }
})
</script>


<style scoped>
.modal-frame {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #fefefe;
  border-radius: 5px;
  width: 50%;
}

.modal-footer {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-top: 30px;
  margin-bottom: 25px;
}

.ok-btn-style a {
  background: #B99B6B;
  border-radius: 5px;
  position: relative;
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin: 0 auto;
  max-width: 150px;
  padding: 8px 15px;
  color: #FFFFFF;
  transition: 0.2s ease-in-out;
  font-weight: 500;
}

.ok-btn-style a:hover {
  background: #8b6f41;
  color: #FFFFFF;
  box-shadow: 0px 0px 7px 2px rgb(0, 0, 0, 0.3);
}

.cancel-btn-style a {
  background: #eee;
  border-radius: 5px;
  position: relative;
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin: 0 auto;
  max-width: 150px;
  padding: 8px 15px;
  color: #313131;
  transition: 0.2s ease-in-out;
  font-weight: 500;
}

.cancel-btn-style a:hover {
  background: #e7dccb;
  box-shadow: 0px 0px 7px 2px rgb(0, 0, 0, 0.3);
}
</style>
