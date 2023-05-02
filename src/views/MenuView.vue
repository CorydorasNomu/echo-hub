<template>
  <div>
    <header-component></header-component>
  </div>
  <div class="flex-base menu-body-container">
    <div class="menu-func-group">
      <div class="flex-base menu-func-box" @click="goToFunction('photo')">
        <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" fill="currentColor" class="bi bi-images" viewBox="0 0 16 16">
          <path d="M4.502 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
          <path d="M14.002 13a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2V5A2 2 0 0 1 2 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-1.998 2zM14 2H4a1 1 0 0 0-1 1h9.002a2 2 0 0 1 2 2v7A1 1 0 0 0 15 11V3a1 1 0 0 0-1-1zM2.002 4a1 1 0 0 0-1 1v8l2.646-2.354a.5.5 0 0 1 .63-.062l2.66 1.773 3.71-3.71a.5.5 0 0 1 .577-.094l1.777 1.947V5a1 1 0 0 0-1-1h-10z"/>
        </svg>
        <label class="menu-func-label">{{ MENU.photo }}</label>
      </div>
      <div class="flex-base menu-func-box" @click="goToFunction('friend')">
        <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" fill="currentColor" class="bi bi-people-fill" viewBox="0 0 16 16">
          <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7Zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5.784 6A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216ZM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/>
        </svg>
        <label class="menu-func-label">{{ MENU.friend }}</label>
      </div>
      <div class="flex-base menu-func-box" @click="goToFunction('share')">
        <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" fill="currentColor" class="bi bi-houses" viewBox="0 0 16 16">
          <path d="m11.798 8.271-3.182 1.97c-.27.166-.616-.036-.616-.372V9.1s-2.571-.3-4 2.4c.571-4.8 3.143-4.8 4-4.8v-.769c0-.336.346-.538.616-.371l3.182 1.969c.27.166.27.576 0 .742z"/>
          <path d="m.5 3 .04.87a1.99 1.99 0 0 0-.342 1.311l.637 7A2 2 0 0 0 2.826 14h10.348a2 2 0 0 0 1.991-1.819l.637-7A2 2 0 0 0 13.81 3H9.828a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 6.172 1H2.5a2 2 0 0 0-2 2zm.694 2.09A1 1 0 0 1 2.19 4h11.62a1 1 0 0 1 .996 1.09l-.636 7a1 1 0 0 1-.996.91H2.826a1 1 0 0 1-.995-.91l-.637-7zM6.172 2a1 1 0 0 1 .707.293L7.586 3H2.19c-.24 0-.47.042-.683.12L1.5 2.98a1 1 0 0 1 1-.98h3.672z"/>
        </svg>
        <label class="menu-func-label">{{ MENU.share }}</label>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// Vue Module
import { defineComponent, onMounted } from 'vue'
import { useRouter } from 'vue-router'
// Firebase Module
import firebase from '../api/firebase'
import { onAuthStateChanged } from "firebase/auth"
// UI Module
import header from '../components/HeaderComponent.vue'
import { MENU } from '@/constants/messages'

export default defineComponent({
  components: {
    'header-component': header
  },

  setup () {
    const router = useRouter()

    const goToFunction = (funcType: string) => {
      router.push({ path: funcType })
    }

    onMounted(() => {
      onAuthStateChanged(firebase.auth, async (user) => {
        if (!user) router.push({ path: "login" })
      })
    })

    return { MENU, goToFunction }
  }
})
</script>

<style scoped>
.flex-base {
  display: flex;
  justify-content: center;
  align-items: center;  
}

.menu-body-container {
  flex-direction: row;
  margin-top: 20%;
}

.menu-func-group {
  display: flex;
  flex-direction: row;
  place-items: center;
}

.menu-func-group :hover {
  cursor: pointer;
  background: #B99B6B;
  color: #FFFFFF;
  box-shadow: 0px 0px 10px 5px rgb(0, 0, 0, 0.3);
}

.menu-func-group label:hover,
.menu-func-group svg:hover { box-shadow: none }

.menu-func-box {
  flex-direction: column;
  border-radius: 7px;
  padding: 20px 50px;
  background: #fcf4e8;
  color: #313131;
  margin-left: 10px;
  margin-right: 10px;
}

.menu-func-label {
  margin-top: 15px;
  font-weight: bold;
}
</style>
