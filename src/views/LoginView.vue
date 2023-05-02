<template>
  <!-- ログイン画面 -->
  <div class="login-screen-frame">
    <h1>{{ COMMON.app }}</h1>
    <div>
      <form class="form-container">
        <div>
          <label for="email">{{ LOGIN.email }}</label>
          <input class="login-form" v-model="state.email.current" type="text" id="email">
        </div>
        <div style="margin-top: 15px;">
          <label for="password">{{ LOGIN.password }}</label>
          <input class="login-form" v-model="state.password.current" type="password" id="password">
        </div>
      </form>
    </div>
    <div class="alert-message-style">
      <div>{{ state.alert.login ? LOGIN.notFillAlert : '' }}</div>
    </div>
    <div class="login-style" style="margin-top: 20px;" @click="login">
      <a href="#">{{ LOGIN.login }}</a>
    </div>
    <div class="login-style" style="margin-top: 20px;" @click="openCreateUserModal">
      <a href="#">{{ LOGIN.createUserBtn }}</a>
    </div>
  </div>

  <!-- アカウント新規作成用のダイアログ -->
  <modal-component v-if="state.modal.mkuser" :title="LOGIN.createUserHeader" :ok="createUser" :cancel="closeModal">
    <div class="modal-body">
      <form class="form-container">
        <div class="mt-10">
          <label for="username">{{ LOGIN.email }}</label>
          <input class="login-form" v-model="state.email.new" type="text" id="email">
        </div>
        <div class="mt-10">
          <label for="newPassword">{{ LOGIN.password }}</label>
          <input  class="login-form" v-model="state.password.new" type="password" id="newPassword">
        </div>
        <div class="mt-10">
          <label for="confirmPassword">{{ LOGIN.confirmPassword }}</label>
          <input class="login-form" v-model="state.password.confirm" type="password" id="confirmPassword">
        </div>
      </form>
      <div v-if="state.alert.mkuser" class="alert-message-style">{{ state.modalMessage }}</div>
    </div>
  </modal-component>

  <!-- アカウント新規作成完了のダイアログ -->
  <modal-component v-if="state.modal.completed" :title="COMMON.completed" :ok="login" :cancel="closeModal">
    <div class="modal-body"><div v-html="LOGIN.createUserCompleted"></div></div>
  </modal-component>

  <!-- アカウント新規作成失敗 / ログイン失敗のダイアログ -->
  <modal-component v-if="state.modal.error" :title="COMMON.error" :isError="true" :ok="closeModal">
    <div class="modal-body"><div v-html="state.modalMessage"></div></div>
  </modal-component>
  
  <!-- 処理実行中のロードアイコン -->
  <spiner-component v-if="state.modal.spiner"></spiner-component>
</template>


<script lang="ts">
// Vue Module
import { defineComponent, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
// Firebase Module
import firebase from '../api/firebase';
import { collection, doc, setDoc } from "firebase/firestore"
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
// UI Components
import modal from '../components/ModalComponent.vue'
import spiner from '../components/ProcessingSpiner.vue'
import { COMMON, LOGIN, PROFILE } from '@/constants/messages'
import { USER } from "@/constants/data"

// View 内変数の型宣言
interface State {
  email: { current: string, new: string },
  password: { current: string, new: string, confirm: string },
  modal: { mkuser: boolean, completed: boolean, error: boolean, spiner: boolean },
  alert: { mkuser: boolean, login: boolean },
  message: string,
  modalMessage: string
}

export default defineComponent({
  // コンポーネント
  components: {
    'modal-component': modal,
    'spiner-component': spiner
  },

  setup () {
    /** 変数 */
    const state = reactive<State>({
      email: { current: '', new: '' },
      password: {  current: '', new: '', confirm: ''  },
      modal: { mkuser: false, completed: false, error: false, spiner: false },
      alert: { mkuser: false, login: false },
      message: '',
      modalMessage: ''
    })
    const router = useRouter()

    /** ライフサイクル */
    onMounted(() => {
      onAuthStateChanged(firebase.auth, (user) => {
        if (user) router.push({ path: '/' })
      })
    })

    /** 関数 */
    const openCreateUserModal = () => {
      state.modal.mkuser = true
    }

    const closeModal = () => {
      state.email.new = ''
      state.password.new = ''
      state.password.confirm = ''
      state.alert.mkuser = false
      state.modal = { mkuser: false, completed: false, error: false, spiner: false }
    }

    const login = () => {
      const email = state.email.new || state.email.current
      const password = state.password.new || state.password.current
      state.alert.login = !(email && password)
      if (state.alert.login) return
      state.modal.mkuser = false
      state.modal.spiner = true
      signInWithEmailAndPassword(firebase.auth, email, password)
        .then((credential) => {
          credential
          state.modal.spiner = false
          router.push({ path: '/' })
        })
        .catch((err) => {
          console.log(err.message)
          state.modal.spiner = false
          state.modalMessage = LOGIN.loginFailed
          state.modal.error = true
        })
    }

    const createUser = () => {
      const form = [state.email.new, state.password.new, state.password.confirm]
      if (form.some(f => !f)) {
        state.modalMessage = LOGIN.notFillAlert
        state.alert.mkuser = true
        return
      }
      if (state.password.new !== state.password.confirm) {
        state.modalMessage = LOGIN.notMatchAlert
        state.alert.mkuser = true
        return
      }
      state.modal.spiner = true
      createUserWithEmailAndPassword(firebase.auth, state.email.new, state.password.new)
        .then(async (credential) => {
          const citiesRef = collection(firebase.db, 'user')
          await setDoc(doc(citiesRef, credential.user.uid), { ...USER, email: state.email.new });
          state.modal.spiner = false
          state.modal.completed = true
        })
        .catch((err) => {
          console.log("[eho-hub][ERROR]", err)
          state.modalMessage = LOGIN.createUserFailed
          state.modal.spiner = false
          state.modal.error = true
        })
    }

    // テンプレートに公開
    return {
      COMMON,
      LOGIN,
      state,
      openCreateUserModal,
      closeModal,
      login,
      createUser
    }
  }
})
</script>

<style scoped>
.login-screen-frame {
  display: flex;
  flex-direction: column;
  margin-top: 15ch;
  place-items: center;
}

.form-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.login-form {
  display: flex;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  padding: 0.25rem;
}

.modal-body {
  margin-top: 20px;
  color: #B99B6B;
}

.login-style a {
  background: #eee;
  border-radius: 50px;
  position: relative;
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin: 0 auto;
  max-width: 150px;
  padding: 10px 20px;
  color: #313131;
  transition: 0.2s ease-in-out;
  font-weight: 500;
}

.login-style a:hover {
  background: #B99B6B;
  color: #FFFFFF;
  box-shadow: 0px 0px 15px 3px rgb(0, 0, 0, 0.3);
}

.register-btn {
  display: flex;
  max-width: 100px;
  background: #F1DBBF;
  border-radius: 3px;
  justify-content: space-around;
  padding: 13px 20px;
  color: #313131;
  margin-left: 10px;
  margin-right: 10px;
}

.register-btn a:hover,
.register-btn a:focus {
  background: #B99B6B;
  color: #313131;
}

.alert-message-style {
  margin-top: 20px;
  color: firebrick;
}

.login-btn a,
.mk-account-btn a {
  margin-top: 20px;
  background: antiquewhite;
  border-radius: 3px;
  display: flex;
  justify-content: space-around;
  padding: 5px 15px;
  color: #313131;
}

.login-btn a:hover,
.mk-account-btn a:hover {
  background: #CBE4DE;
  color: #313131;
}
</style>
